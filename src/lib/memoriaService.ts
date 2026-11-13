import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { STARTER_MEMORIES } from './sampleAssets';
import { buildExcerpt, FIELD_LIMITS, sanitizeMemoryInput, sanitizeProfileSettings } from './validation';
import { Album, Memory, MemoryCategory, MemoryInput, ReminderFrequency, UserProfile } from '../types/memoria';

function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function ensureUserProfileAndSeed(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const displayName = (user.displayName || user.email?.split('@')[0] || 'Sahabat Memoria').slice(
        0,
        FIELD_LIMITS.DISPLAY_NAME_MAX
      );
      const email = (user.email || 'user@memoria.app').slice(0, 200);
      const photoURL = (user.photoURL || '').slice(0, FIELD_LIMITS.PHOTO_URL_MAX);

      const batch = writeBatch(db);
      batch.set(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        journalTitle: 'Kenangan Hidupku',
        journalSubtitle: 'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.',
        quote: 'Simpan cerita, abadikan momen, kenang sepanjang waktu.',
        reminderFrequency: 'weekly',
        seededDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      STARTER_MEMORIES.forEach((seed) => {
        const memId = `seed_${seed.idSuffix}_${user.uid.slice(0, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
        const memRef = doc(db, 'memories', memId);
        batch.set(memRef, {
          id: memId,
          userId: user.uid,
          title: seed.title,
          story: seed.story,
          excerpt: buildExcerpt(seed.story),
          date: seed.date,
          year: Number(seed.date.slice(0, 4)),
          location: seed.location,
          category: seed.category,
          mood: seed.mood,
          photos: seed.photos,
          isMilestone: seed.isMilestone,
          isFavorite: seed.isFavorite,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      const albumId = `album_2026_${user.uid.slice(0, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
      batch.set(doc(db, 'albums', albumId), {
        id: albumId,
        userId: user.uid,
        name: 'Jejak Langkah 2026',
        description: 'Kumpulan momen penting sepanjang tahun 2026 dari pendakian hingga babak baru keluarga.',
        categoryFilter: 'Semua',
        yearFilter: 2026,
        coverPhoto: STARTER_MEMORIES[0].photos[0] || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (err: Error) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as UserProfile);
      } else {
        onData(null);
      }
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function updateUserProfile(
  uid: string,
  settings: {
    journalTitle: string;
    journalSubtitle: string;
    quote: string;
    reminderFrequency: ReminderFrequency;
  }
): Promise<void> {
  const clean = sanitizeProfileSettings(settings);
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeMemories(
  uid: string,
  onData: (memories: Memory[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'memories'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Memory);
      items.sort((a, b) => b.date.localeCompare(a.date));
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'memories');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function createMemory(uid: string, input: MemoryInput): Promise<string> {
  const checked = sanitizeMemoryInput(input);
  if (!checked.valid || !checked.data) {
    throw new Error(checked.error || 'Data kenangan tidak valid.');
  }

  const id = generateSafeId('mem');
  const path = `memories/${id}`;
  try {
    await setDoc(doc(db, 'memories', id), {
      id,
      userId: uid,
      ...checked.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMemory(memoryId: string, input: MemoryInput): Promise<void> {
  const checked = sanitizeMemoryInput(input);
  if (!checked.valid || !checked.data) {
    throw new Error(checked.error || 'Data kenangan tidak valid.');
  }

  const path = `memories/${memoryId}`;
  try {
    await updateDoc(doc(db, 'memories', memoryId), {
      ...checked.data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleFavoriteMemory(memoryId: string, isFavorite: boolean): Promise<void> {
  const path = `memories/${memoryId}`;
  try {
    await updateDoc(doc(db, 'memories', memoryId), {
      isFavorite,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const path = `memories/${memoryId}`;
  try {
    await deleteDoc(doc(db, 'memories', memoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeAlbums(
  uid: string,
  onData: (albums: Album[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'albums'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Album);
      items.sort((a, b) => b.yearFilter - a.yearFilter || a.name.localeCompare(b.name));
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'albums');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function createAlbum(
  uid: string,
  input: {
    name: string;
    description: string;
    categoryFilter: 'Semua' | MemoryCategory;
    yearFilter: number;
    coverPhoto: string;
  }
): Promise<string> {
  const name = input.name.trim().slice(0, FIELD_LIMITS.ALBUM_NAME_MAX);
  if (!name) throw new Error('Nama album wajib diisi.');
  const description = input.description.trim().slice(0, FIELD_LIMITS.ALBUM_DESC_MAX);
  const coverPhoto = input.coverPhoto.trim().slice(0, FIELD_LIMITS.PHOTO_URL_MAX);
  const yearFilter = input.yearFilter === 0 ? 0 : Math.min(2100, Math.max(1900, Math.round(input.yearFilter)));

  const id = generateSafeId('alb');
  const path = `albums/${id}`;
  try {
    await setDoc(doc(db, 'albums', id), {
      id,
      userId: uid,
      name,
      description,
      categoryFilter: input.categoryFilter,
      yearFilter,
      coverPhoto,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const path = `albums/${albumId}`;
  try {
    await deleteDoc(doc(db, 'albums', albumId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function uploadPhotosToServer(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  files.slice(0, 10).forEach((file) => {
    formData.append('photos', file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Gagal mengunggah foto ke server.');
  }
  return payload.urls as string[];
}
