import { User } from 'firebase/auth';
import { resolvePhotoUrl, STARTER_MEMORIES } from './sampleAssets';
import { buildExcerpt, sanitizeMemoryInput, sanitizeProfileSettings } from './validation';
import {
  Album,
  Memory,
  MemoryCategory,
  MemoryInput,
  MemoryMood,
  ReminderFrequency,
  UserProfile,
} from '../types/memoria';

export const DEFAULT_SPREADSHEET_ID = '1LxsazvS-NPyh7d0kTMPnAw4R39nypSZG8CiKqt0hzio';

export const SHEET_TABS = {
  PROFILE: 'Memoria_Profile',
  MEMORIES: 'Memoria_Memories',
  PHOTOS: 'Memoria_Photos',
  ALBUMS: 'Memoria_Albums',
} as const;

const HEADERS = {
  PROFILE: [
    'uid',
    'displayName',
    'email',
    'photoURL',
    'journalTitle',
    'journalSubtitle',
    'quote',
    'reminderFrequency',
    'seededDemo',
    'updatedAt',
  ],
  MEMORIES: [
    'id',
    'userId',
    'title',
    'story',
    'excerpt',
    'date',
    'year',
    'location',
    'category',
    'mood',
    'photoRefsJson',
    'isMilestone',
    'isFavorite',
    'createdAt',
    'updatedAt',
  ],
  PHOTOS: [
    'photoId',
    'memoryId',
    'userId',
    'sortOrder',
    'chunkIndex',
    'totalChunks',
    'dataChunk',
    'createdAt',
  ],
  ALBUMS: [
    'id',
    'userId',
    'name',
    'description',
    'categoryFilter',
    'yearFilter',
    'coverPhoto',
    'createdAt',
    'updatedAt',
  ],
};

// Keep each cell strictly under Google Sheets' 50,000 character cell limit
const CHUNK_SIZE = 40000;

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return trimmed || DEFAULT_SPREADSHEET_ID;
}

export class SheetsAuthExpiredError extends Error {
  constructor(message = 'Sesi izin Google Sheets telah berakhir. Silakan masuk ulang.') {
    super(message);
    this.name = 'SheetsAuthExpiredError';
  }
}

async function sheetsFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    throw new SheetsAuthExpiredError();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      `Gagal mengakses Google Sheets (HTTP ${res.status}). Pastikan akun Google Anda memiliki akses edit ke spreadsheet ini.`;
    throw new Error(msg);
  }
  return data;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function splitChunks(str: string): string[] {
  if (!str) return [''];
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    chunks.push(str.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export interface SpreadsheetSummary {
  spreadsheetId: string;
  title: string;
  sheetNames: string[];
  photoRowsCount: number;
  memoryRowsCount: number;
}

export interface MemoriaSheetBundle {
  summary: SpreadsheetSummary;
  profile: UserProfile;
  memories: Memory[];
  albums: Album[];
  // Map photoId -> full dataUrl or asset key so edits preserve existing photoIds
  photoRecordMap: Map<string, string>;
}

/**
 * Inspects spreadsheet metadata first (never assumes sheet names) and creates
 * missing Memoria tabs cleanly.
 */
async function ensureTabsAndHeaders(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetNames: string[] }> {
  const meta = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
    accessToken
  );

  const title: string = meta?.properties?.title || 'MEMORIA Spreadsheet';
  const existingTitles = new Set<string>(
    (meta?.sheets || []).map((s: any) => String(s?.properties?.title || ''))
  );

  const missingTabs = Object.values(SHEET_TABS).filter((name) => !existingTitles.has(name));

  if (missingTabs.length > 0) {
    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: missingTabs.map((tabName) => ({
            addSheet: {
              properties: {
                title: tabName,
              },
            },
          })),
        }),
      }
    );

    // Write headers into newly created tabs
    const headerUpdates = missingTabs.map((tabName) => {
      const values =
        tabName === SHEET_TABS.PROFILE
          ? [HEADERS.PROFILE]
          : tabName === SHEET_TABS.MEMORIES
          ? [HEADERS.MEMORIES]
          : tabName === SHEET_TABS.PHOTOS
          ? [HEADERS.PHOTOS]
          : [HEADERS.ALBUMS];
      return {
        range: `'${tabName}'!A1`,
        values,
      };
    });

    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: headerUpdates,
        }),
      }
    );
  }

  return {
    title,
    sheetNames: [...existingTitles, ...missingTabs],
  };
}

async function readAllTabs(accessToken: string, spreadsheetId: string) {
  const ranges = [
    `'${SHEET_TABS.PROFILE}'!A1:J`,
    `'${SHEET_TABS.MEMORIES}'!A1:O`,
    `'${SHEET_TABS.PHOTOS}'!A1:H`,
    `'${SHEET_TABS.ALBUMS}'!A1:I`,
  ]
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&');

  const res = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges}`,
    accessToken
  );

  const valueRanges = res?.valueRanges || [];
  return {
    profileRows: (valueRanges[0]?.values || []) as string[][],
    memoryRows: (valueRanges[1]?.values || []) as string[][],
    photoRows: (valueRanges[2]?.values || []) as string[][],
    albumRows: (valueRanges[3]?.values || []) as string[][],
  };
}

async function rewriteTab(
  accessToken: string,
  spreadsheetId: string,
  tabName: string,
  headers: string[],
  rows: (string | number | boolean)[][]
) {
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `'${tabName}'!A:Z`
    )}:clear`,
    accessToken,
    { method: 'POST', body: JSON.stringify({}) }
  );

  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `'${tabName}'!A1`
    )}?valueInputOption=RAW`,
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: `'${tabName}'!A1`,
        majorDimension: 'ROWS',
        values: [headers, ...rows],
      }),
    }
  );
}

function buildPhotoMap(photoRows: string[][]): Map<string, string> {
  const grouped = new Map<string, { chunkIndex: number; dataChunk: string }[]>();
  photoRows.slice(1).forEach((row) => {
    const photoId = row[0];
    if (!photoId) return;
    const chunkIndex = Number(row[4] || 0);
    const dataChunk = row[6] || '';
    const arr = grouped.get(photoId) || [];
    arr.push({ chunkIndex, dataChunk });
    grouped.set(photoId, arr);
  });

  const result = new Map<string, string>();
  grouped.forEach((chunks, photoId) => {
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    result.set(
      photoId,
      chunks.map((c) => c.dataChunk).join('')
    );
  });
  return result;
}

export async function loadMemoriaFromSheet(
  accessToken: string,
  spreadsheetId: string,
  user: User
): Promise<MemoriaSheetBundle> {
  const meta = await ensureTabsAndHeaders(accessToken, spreadsheetId);
  let tabs = await readAllTabs(accessToken, spreadsheetId);

  const profileDataRows = tabs.profileRows.slice(1).filter((r) => r[0]);
  const memoryDataRows = tabs.memoryRows.slice(1).filter((r) => r[0]);
  const albumDataRows = tabs.albumRows.slice(1).filter((r) => r[0]);

  const nowIso = new Date().toISOString();

  // Seed initial profile & starter memories if sheet has no Memoria data yet
  if (profileDataRows.length === 0 && memoryDataRows.length === 0) {
    const defaultProfileRow = [
      user.uid,
      user.displayName || user.email?.split('@')[0] || 'Sahabat Memoria',
      user.email || '',
      user.photoURL || '',
      'Kenangan Hidupku',
      'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.',
      'Simpan cerita, abadikan momen, kenang sepanjang waktu.',
      'weekly',
      'true',
      nowIso,
    ];

    const seedMemoryRows = STARTER_MEMORIES.map((seed) => {
      const memId = `seed_${seed.idSuffix}`;
      return [
        memId,
        user.uid,
        seed.title,
        seed.story,
        buildExcerpt(seed.story),
        seed.date,
        String(Number(seed.date.slice(0, 4))),
        seed.location,
        seed.category,
        seed.mood,
        JSON.stringify(seed.photoRefs),
        seed.isMilestone ? 'true' : 'false',
        seed.isFavorite ? 'true' : 'false',
        nowIso,
        nowIso,
      ];
    });

    const seedAlbumRow = [
      'album_2026',
      user.uid,
      'Jejak Langkah 2026',
      'Kumpulan momen penting sepanjang tahun 2026 dari pendakian hingga babak baru keluarga.',
      'Semua',
      '2026',
      'asset:dieng',
      nowIso,
      nowIso,
    ];

    await Promise.all([
      rewriteTab(accessToken, spreadsheetId, SHEET_TABS.PROFILE, HEADERS.PROFILE, [
        defaultProfileRow,
      ]),
      rewriteTab(accessToken, spreadsheetId, SHEET_TABS.MEMORIES, HEADERS.MEMORIES, seedMemoryRows),
      rewriteTab(accessToken, spreadsheetId, SHEET_TABS.PHOTOS, HEADERS.PHOTOS, []),
      rewriteTab(accessToken, spreadsheetId, SHEET_TABS.ALBUMS, HEADERS.ALBUMS, [seedAlbumRow]),
    ]);

    tabs = await readAllTabs(accessToken, spreadsheetId);
  }

  const finalProfileRows = tabs.profileRows.slice(1).filter((r) => r[0]);
  const finalMemoryRows = tabs.memoryRows.slice(1).filter((r) => r[0]);
  const finalPhotoRows = tabs.photoRows.slice(1).filter((r) => r[0]);
  const finalAlbumRows = tabs.albumRows.slice(1).filter((r) => r[0]);

  const photoRecordMap = buildPhotoMap(tabs.photoRows);

  const pRow =
    finalProfileRows.find((r) => r[0] === user.uid) || finalProfileRows[0] || [];

  const profile: UserProfile = {
    uid: pRow[0] || user.uid,
    displayName: pRow[1] || user.displayName || 'Sahabat Memoria',
    email: pRow[2] || user.email || '',
    photoURL: pRow[3] || user.photoURL || '',
    journalTitle: pRow[4] || 'Kenangan Hidupku',
    journalSubtitle:
      pRow[5] || 'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.',
    quote: pRow[6] || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.',
    reminderFrequency: (['daily', 'weekly', 'off'].includes(pRow[7])
      ? pRow[7]
      : 'weekly') as ReminderFrequency,
    seededDemo: pRow[8] === 'true',
    updatedAt: pRow[9] || nowIso,
  };

  const memories: Memory[] = finalMemoryRows.map((row) => {
    let refs: string[] = [];
    try {
      const parsed = JSON.parse(row[10] || '[]');
      if (Array.isArray(parsed)) refs = parsed;
    } catch {
      refs = [];
    }

    const resolvedPhotos = refs
      .map((ref) => {
        if (ref.startsWith('asset:') || ref.startsWith('http') || ref.startsWith('data:')) {
          return resolvePhotoUrl(ref);
        }
        return photoRecordMap.get(ref) || '';
      })
      .filter(Boolean);

    return {
      id: row[0],
      userId: row[1] || user.uid,
      title: row[2] || 'Tanpa Judul',
      story: row[3] || '',
      excerpt: row[4] || buildExcerpt(row[3] || ''),
      date: row[5] || '2026-01-01',
      year: Number(row[6] || String(row[5] || '2026').slice(0, 4)),
      location: row[7] || 'Indonesia',
      category: (row[8] || 'Lainnya') as MemoryCategory,
      mood: (row[9] || 'Bahagia') as MemoryMood,
      photos: resolvedPhotos,
      isMilestone: row[11] === 'true',
      isFavorite: row[12] === 'true',
      createdAt: row[13],
      updatedAt: row[14],
    };
  });

  memories.sort((a, b) => b.date.localeCompare(a.date));

  const albums: Album[] = finalAlbumRows.map((row) => ({
    id: row[0],
    userId: row[1] || user.uid,
    name: row[2] || 'Album',
    description: row[3] || '',
    categoryFilter: (row[4] || 'Semua') as 'Semua' | MemoryCategory,
    yearFilter: Number(row[5] || 0),
    coverPhoto: resolvePhotoUrl(row[6] || ''),
    createdAt: row[7],
    updatedAt: row[8],
  }));

  return {
    summary: {
      spreadsheetId,
      title: meta.title,
      sheetNames: meta.sheetNames,
      photoRowsCount: finalPhotoRows.length,
      memoryRowsCount: finalMemoryRows.length,
    },
    profile,
    memories,
    albums,
    photoRecordMap,
  };
}

function encodeMemoryPhotosForSheet(
  memoryId: string,
  userId: string,
  photos: string[],
  nowIso: string
): { photoRefs: string[]; newPhotoRows: string[][] } {
  const photoRefs: string[] = [];
  const newPhotoRows: string[][] = [];

  // Reverse lookup for bundled assets so starter images stay compact as asset:* keys
  const reverseAssetLookup = new Map<string, string>();
  ['asset:hero', 'asset:dieng', 'asset:engagement', 'asset:firstcar', 'asset:graduation'].forEach(
    (key) => {
      const resolved = resolvePhotoUrl(key);
      if (resolved) reverseAssetLookup.set(resolved, key);
    }
  );

  photos.forEach((src, sortOrder) => {
    const assetKey = reverseAssetLookup.get(src);
    if (assetKey) {
      photoRefs.push(assetKey);
      return;
    }

    const photoId = `ph_${memoryId}_${sortOrder}_${Math.random().toString(36).slice(2, 6)}`;
    photoRefs.push(photoId);

    const chunks = splitChunks(src);
    chunks.forEach((chunk, chunkIndex) => {
      newPhotoRows.push([
        photoId,
        memoryId,
        userId,
        String(sortOrder),
        String(chunkIndex),
        String(chunks.length),
        chunk,
        nowIso,
      ]);
    });
  });

  return { photoRefs, newPhotoRows };
}

export async function saveMemoryToSheet(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: MemoryInput,
  editingId?: string
): Promise<void> {
  const checked = sanitizeMemoryInput({
    ...input,
    // Allow longer base64 data URLs since we chunk them into Memoria_Photos
    photos: input.photos.slice(0, 10),
  });
  if (!checked.valid || !checked.data) {
    throw new Error(checked.error || 'Data kenangan tidak valid.');
  }

  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const nowIso = new Date().toISOString();
  const memoryId = editingId || generateId('mem');

  const existingMemoryRows = tabs.memoryRows.slice(1).filter((r) => r[0]);
  const existingPhotoRows = tabs.photoRows.slice(1).filter((r) => r[0]);

  const prevRow = existingMemoryRows.find((r) => r[0] === memoryId);
  const createdAt = prevRow?.[13] || nowIso;

  // Use raw input.photos (base64 data URLs or asset URLs) without 1000-char truncation
  const cleanPhotos = (input.photos || []).filter(Boolean).slice(0, 10);
  const { photoRefs, newPhotoRows } = encodeMemoryPhotosForSheet(
    memoryId,
    userId,
    cleanPhotos,
    nowIso
  );

  const nextMemoryRow = [
    memoryId,
    userId,
    checked.data.title,
    checked.data.story,
    checked.data.excerpt,
    checked.data.date,
    String(checked.data.year),
    checked.data.location,
    checked.data.category,
    checked.data.mood,
    JSON.stringify(photoRefs),
    checked.data.isMilestone ? 'true' : 'false',
    checked.data.isFavorite ? 'true' : 'false',
    createdAt,
    nowIso,
  ];

  const updatedMemoryRows = prevRow
    ? existingMemoryRows.map((r) => (r[0] === memoryId ? nextMemoryRow : r))
    : [nextMemoryRow, ...existingMemoryRows];

  // Replace any photo rows belonging to this memoryId
  const remainingPhotoRows = existingPhotoRows.filter((r) => r[1] !== memoryId);
  const updatedPhotoRows = [...remainingPhotoRows, ...newPhotoRows];

  await Promise.all([
    rewriteTab(accessToken, spreadsheetId, SHEET_TABS.MEMORIES, HEADERS.MEMORIES, updatedMemoryRows),
    rewriteTab(accessToken, spreadsheetId, SHEET_TABS.PHOTOS, HEADERS.PHOTOS, updatedPhotoRows),
  ]);
}

export async function toggleFavoriteInSheet(
  accessToken: string,
  spreadsheetId: string,
  memoryId: string,
  isFavorite: boolean
): Promise<void> {
  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const existingRows = tabs.memoryRows.slice(1).filter((r) => r[0]);
  const nowIso = new Date().toISOString();

  const updated = existingRows.map((row) => {
    if (row[0] !== memoryId) return row;
    const copy = [...row];
    copy[12] = isFavorite ? 'true' : 'false';
    copy[14] = nowIso;
    return copy;
  });

  await rewriteTab(accessToken, spreadsheetId, SHEET_TABS.MEMORIES, HEADERS.MEMORIES, updated);
}

export async function deleteMemoryFromSheet(
  accessToken: string,
  spreadsheetId: string,
  memoryId: string
): Promise<void> {
  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const remainingMemories = tabs.memoryRows
    .slice(1)
    .filter((r) => r[0] && r[0] !== memoryId);
  const remainingPhotos = tabs.photoRows
    .slice(1)
    .filter((r) => r[0] && r[1] !== memoryId);

  await Promise.all([
    rewriteTab(accessToken, spreadsheetId, SHEET_TABS.MEMORIES, HEADERS.MEMORIES, remainingMemories),
    rewriteTab(accessToken, spreadsheetId, SHEET_TABS.PHOTOS, HEADERS.PHOTOS, remainingPhotos),
  ]);
}

export async function saveAlbumToSheet(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: {
    name: string;
    description: string;
    categoryFilter: 'Semua' | MemoryCategory;
    yearFilter: number;
    coverPhoto: string;
  }
): Promise<void> {
  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const existingAlbums = tabs.albumRows.slice(1).filter((r) => r[0]);
  const nowIso = new Date().toISOString();

  // Keep coverPhoto concise if it's a bundled asset
  let coverRef = input.coverPhoto || '';
  ['asset:hero', 'asset:dieng', 'asset:engagement', 'asset:firstcar', 'asset:graduation'].forEach(
    (key) => {
      if (resolvePhotoUrl(key) === coverRef) coverRef = key;
    }
  );
  if (coverRef.length > 40000) coverRef = coverRef.slice(0, 40000);

  const newRow = [
    generateId('alb'),
    userId,
    input.name.trim().slice(0, 80),
    input.description.trim().slice(0, 300),
    input.categoryFilter,
    String(input.yearFilter || 0),
    coverRef,
    nowIso,
    nowIso,
  ];

  await rewriteTab(accessToken, spreadsheetId, SHEET_TABS.ALBUMS, HEADERS.ALBUMS, [
    ...existingAlbums,
    newRow,
  ]);
}

export async function deleteAlbumFromSheet(
  accessToken: string,
  spreadsheetId: string,
  albumId: string
): Promise<void> {
  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const remaining = tabs.albumRows.slice(1).filter((r) => r[0] && r[0] !== albumId);
  await rewriteTab(accessToken, spreadsheetId, SHEET_TABS.ALBUMS, HEADERS.ALBUMS, remaining);
}

export async function saveProfileToSheet(
  accessToken: string,
  spreadsheetId: string,
  user: User,
  settings: {
    journalTitle: string;
    journalSubtitle: string;
    quote: string;
    reminderFrequency: ReminderFrequency;
  }
): Promise<void> {
  const clean = sanitizeProfileSettings(settings);
  const tabs = await readAllTabs(accessToken, spreadsheetId);
  const existing = tabs.profileRows.slice(1).filter((r) => r[0]);
  const nowIso = new Date().toISOString();

  const updatedRow = [
    user.uid,
    user.displayName || user.email?.split('@')[0] || 'Sahabat Memoria',
    user.email || '',
    user.photoURL || '',
    clean.journalTitle,
    clean.journalSubtitle,
    clean.quote,
    clean.reminderFrequency,
    'true',
    nowIso,
  ];

  const found = existing.some((r) => r[0] === user.uid);
  const nextRows = found
    ? existing.map((r) => (r[0] === user.uid ? updatedRow : r))
    : [updatedRow, ...existing];

  await rewriteTab(accessToken, spreadsheetId, SHEET_TABS.PROFILE, HEADERS.PROFILE, nextRows);
}
