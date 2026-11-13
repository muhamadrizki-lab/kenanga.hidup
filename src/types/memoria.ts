export type MemoryCategory =
  | 'Keluarga'
  | 'Karier'
  | 'Travel'
  | 'Pendakian'
  | 'Pencapaian'
  | 'Lainnya';

export type MemoryMood =
  | 'Bahagia'
  | 'Bersyukur'
  | 'Haru'
  | 'Bangga'
  | 'Tenang'
  | 'Petualang';

export type ReminderFrequency = 'daily' | 'weekly' | 'off';

export type NavSection =
  | 'beranda'
  | 'timeline'
  | 'galeri'
  | 'cerita'
  | 'kategori'
  | 'statistik'
  | 'pengaturan';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  journalTitle: string;
  journalSubtitle: string;
  quote: string;
  reminderFrequency: ReminderFrequency;
  seededDemo: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  story: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  year: number;
  location: string;
  category: MemoryCategory;
  mood: MemoryMood;
  photos: string[];
  isMilestone: boolean;
  isFavorite: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  description: string;
  categoryFilter: 'Semua' | MemoryCategory;
  yearFilter: number; // 0 = all years
  coverPhoto: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MemoryInput {
  title: string;
  story: string;
  date: string;
  location: string;
  category: MemoryCategory;
  mood: MemoryMood;
  photos: string[];
  isMilestone: boolean;
  isFavorite: boolean;
}
