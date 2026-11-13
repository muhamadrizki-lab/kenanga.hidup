import { MemoryCategory, MemoryInput, MemoryMood, ReminderFrequency } from '../types/memoria';

// Boundaries synced verbatim with firebase-blueprint.json & firestore.rules
export const FIELD_LIMITS = {
  ID_MAX: 128,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  DATE_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  DISPLAY_NAME_MAX: 100,
  JOURNAL_TITLE_MAX: 80,
  JOURNAL_SUBTITLE_MAX: 220,
  QUOTE_MAX: 220,
  TITLE_MAX: 140,
  STORY_MAX: 10000,
  EXCERPT_MAX: 280,
  LOCATION_MAX: 160,
  PHOTOS_MAX_COUNT: 10,
  PHOTO_URL_MAX: 1000,
  ALBUM_NAME_MAX: 80,
  ALBUM_DESC_MAX: 300,
};

export const MEMORY_CATEGORIES: MemoryCategory[] = [
  'Keluarga',
  'Karier',
  'Travel',
  'Pendakian',
  'Pencapaian',
  'Lainnya',
];

export const MEMORY_MOODS: MemoryMood[] = [
  'Bahagia',
  'Bersyukur',
  'Haru',
  'Bangga',
  'Tenang',
  'Petualang',
];

export function buildExcerpt(story: string): string {
  const clean = story.replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).trim()}...`;
}

export function sanitizeMemoryInput(input: MemoryInput): {
  valid: boolean;
  error?: string;
  data?: MemoryInput & { excerpt: string; year: number };
} {
  const title = input.title.trim().slice(0, FIELD_LIMITS.TITLE_MAX);
  const story = input.story.trim().slice(0, FIELD_LIMITS.STORY_MAX);
  const location = input.location.trim().slice(0, FIELD_LIMITS.LOCATION_MAX);
  const date = input.date.trim();

  if (!title) {
    return { valid: false, error: 'Judul kenangan wajib diisi.' };
  }
  if (!story) {
    return { valid: false, error: 'Cerita kenangan wajib diisi.' };
  }
  if (!FIELD_LIMITS.DATE_PATTERN.test(date)) {
    return { valid: false, error: 'Format tanggal tidak valid (gunakan YYYY-MM-DD).' };
  }
  const year = Number(date.slice(0, 4));
  if (Number.isNaN(year) || year < 1900 || year > 2100) {
    return { valid: false, error: 'Tahun kejadian harus antara 1900 dan 2100.' };
  }

  const category = MEMORY_CATEGORIES.includes(input.category) ? input.category : 'Lainnya';
  const mood = MEMORY_MOODS.includes(input.mood) ? input.mood : 'Bahagia';
  const photos = (input.photos || [])
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 300000)
    .slice(0, FIELD_LIMITS.PHOTOS_MAX_COUNT);

  const excerpt = buildExcerpt(story).slice(0, FIELD_LIMITS.EXCERPT_MAX);

  return {
    valid: true,
    data: {
      title,
      story,
      excerpt,
      date,
      year,
      location: location || 'Indonesia',
      category,
      mood,
      photos,
      isMilestone: Boolean(input.isMilestone),
      isFavorite: Boolean(input.isFavorite),
    },
  };
}

export function sanitizeProfileSettings(settings: {
  journalTitle: string;
  journalSubtitle: string;
  quote: string;
  reminderFrequency: ReminderFrequency;
}) {
  const journalTitle = settings.journalTitle.trim().slice(0, FIELD_LIMITS.JOURNAL_TITLE_MAX) || 'Kenangan Hidupku';
  const journalSubtitle = settings.journalSubtitle.trim().slice(0, FIELD_LIMITS.JOURNAL_SUBTITLE_MAX);
  const quote = settings.quote.trim().slice(0, FIELD_LIMITS.QUOTE_MAX);
  const reminderFrequency: ReminderFrequency = ['daily', 'weekly', 'off'].includes(settings.reminderFrequency)
    ? settings.reminderFrequency
    : 'weekly';
  return { journalTitle, journalSubtitle, quote, reminderFrequency };
}

export function formatIndonesianDate(dateStr: string): string {
  if (!FIELD_LIMITS.DATE_PATTERN.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const monthLabel = months[(m - 1) % 12] || 'Jan';
  return `${String(d).padStart(2, '0')} ${monthLabel} ${y}`;
}
