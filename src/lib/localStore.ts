import { resolvePhotoUrl, STARTER_MEMORIES } from './sampleAssets';
import { buildExcerpt } from './validation';
import { Album, Memory, UserProfile } from '../types/memoria';

const DB_NAME = 'memoria_local_db';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const STATE_KEY = 'memoria_workspace_v1';

export interface LocalMemoriaState {
  profile: UserProfile;
  memories: Memory[];
  albums: Album[];
}

function createInitialState(): LocalMemoriaState {
  const nowIso = new Date().toISOString();

  const profile: UserProfile = {
    uid: 'local_user',
    displayName: 'Muhamad Rizki',
    email: 'Pengguna Lokal MEMORIA',
    photoURL: '',
    journalTitle: 'Kenangan Hidupku',
    journalSubtitle:
      'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.',
    quote: 'Simpan cerita, abadikan momen, kenang sepanjang waktu.',
    reminderFrequency: 'weekly',
    seededDemo: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const memories: Memory[] = STARTER_MEMORIES.map((seed) => ({
    id: `seed_${seed.idSuffix}`,
    userId: 'local_user',
    title: seed.title,
    story: seed.story,
    excerpt: buildExcerpt(seed.story),
    date: seed.date,
    year: Number(seed.date.slice(0, 4)),
    location: seed.location,
    category: seed.category,
    mood: seed.mood,
    photos: seed.photoRefs.map(resolvePhotoUrl).filter(Boolean),
    isMilestone: seed.isMilestone,
    isFavorite: seed.isFavorite,
    createdAt: nowIso,
    updatedAt: nowIso,
  }));

  memories.sort((a, b) => b.date.localeCompare(a.date));

  const albums: Album[] = [
    {
      id: 'album_2026',
      userId: 'local_user',
      name: 'Jejak Langkah 2026',
      description:
        'Kumpulan momen penting sepanjang tahun 2026 dari pendakian hingga babak baru keluarga.',
      categoryFilter: 'Semua',
      yearFilter: 2026,
      coverPhoto: resolvePhotoUrl('asset:dieng'),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  return { profile, memories, albums };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadLocalMemoriaState(): Promise<LocalMemoriaState> {
  try {
    const db = await openDB();
    return await new Promise<LocalMemoriaState>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(STATE_KEY);
      getReq.onsuccess = () => {
        if (getReq.result) {
          resolve(getReq.result as LocalMemoriaState);
        } else {
          const initial = createInitialState();
          saveLocalMemoriaState(initial).finally(() => resolve(initial));
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    return createInitialState();
  }
}

export async function saveLocalMemoriaState(state: LocalMemoriaState): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(state, STATE_KEY);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.error('Failed saving local state:', err);
  }
}
