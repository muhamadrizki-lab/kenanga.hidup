import { useState, useEffect, DragEvent } from 'react';
import {
  Calendar,
  Heart,
  ImagePlus,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { compressImageForSpreadsheet } from '../lib/imageCompression';
import { FIELD_LIMITS, MEMORY_CATEGORIES, MEMORY_MOODS } from '../lib/validation';
import { Memory, MemoryCategory, MemoryInput, MemoryMood } from '../types/memoria';

interface MemoryEditorModalProps {
  open: boolean;
  initialMemory: Memory | null;
  onClose: () => void;
  onSave: (input: MemoryInput, editingId?: string) => Promise<void>;
}

export function MemoryEditorModal({
  open,
  initialMemory,
  onClose,
  onSave,
}: MemoryEditorModalProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Travel');
  const [mood, setMood] = useState<MemoryMood>('Bahagia');
  const [story, setStory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialMemory) {
      setTitle(initialMemory.title);
      setDate(initialMemory.date);
      setLocation(initialMemory.location);
      setCategory(initialMemory.category);
      setMood(initialMemory.mood);
      setStory(initialMemory.story);
      setPhotos(initialMemory.photos || []);
      setIsMilestone(initialMemory.isMilestone);
      setIsFavorite(initialMemory.isFavorite);
    } else {
      setTitle('');
      setDate(today);
      setLocation('');
      setCategory('Travel');
      setMood('Bahagia');
      setStory('');
      setPhotos([]);
      setIsMilestone(true);
      setIsFavorite(false);
    }
    setError(null);
  }, [open, initialMemory, today]);

  if (!open) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = FIELD_LIMITS.PHOTOS_MAX_COUNT - photos.length;
    if (remainingSlots <= 0) {
      setError(`Maksimal ${FIELD_LIMITS.PHOTOS_MAX_COUNT} foto per kenangan.`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remainingSlots);
    setError(null);
    setCompressing(true);
    try {
      const compressedList: string[] = [];
      for (const file of selected) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" bukan format gambar yang didukung.`);
        }
        const { dataUrl } = await compressImageForSpreadsheet(file);
        compressedList.push(dataUrl);
      }
      setPhotos((prev) => [...prev, ...compressedList]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses foto.');
    } finally {
      setCompressing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      return [chosen, ...next];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) {
      setError('Judul dan cerita kenangan wajib diisi.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(
        {
          title,
          date,
          location,
          category,
          mood,
          story,
          photos,
          isMilestone,
          isFavorite,
        },
        initialMemory?.id
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kenangan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12162C]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-editor-title"
    >
      <div className="bg-white rounded-2xl border border-[#E6E8F0] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E8F0] flex items-center justify-between">
          <div>
            <h2 id="memory-editor-title" className="font-display text-xl font-semibold text-[#171A2E]">
              {initialMemory ? 'Edit Kenangan' : 'Abadikan Kenangan Baru'}
            </h2>
            <p className="text-xs text-[#646B84] mt-0.5">
              Foto otomatis dikompresi ringan agar muat dan gratis di Google Spreadsheet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-xl text-[#646B84] hover:text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs"
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="mem-title" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
              Judul Momen <span className="text-red-500">*</span>
            </label>
            <input
              id="mem-title"
              type="text"
              required
              maxLength={FIELD_LIMITS.TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pendakian Puncak Sikunir Dieng"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] text-sm text-[#171A2E] focus:outline-none focus:border-[#4F5BD5]"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mem-date" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Tanggal Kejadian <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#646B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="mem-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E6E8F0] text-sm text-[#171A2E] tabular-nums focus:outline-none focus:border-[#4F5BD5]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mem-location" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Lokasi
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#646B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="mem-location"
                  type="text"
                  maxLength={FIELD_LIMITS.LOCATION_MAX}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kota, gunung, atau tempat spesial"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E6E8F0] text-sm text-[#171A2E] focus:outline-none focus:border-[#4F5BD5]"
                />
              </div>
            </div>
          </div>

          {/* Category & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mem-category" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Kategori
              </label>
              <select
                id="mem-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] bg-white text-sm text-[#171A2E] focus:outline-none focus:border-[#4F5BD5]"
              >
                {MEMORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mem-mood" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Nuansa Perasaan
              </label>
              <select
                id="mem-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as MemoryMood)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] bg-white text-sm text-[#171A2E] focus:outline-none focus:border-[#4F5BD5]"
              >
                {MEMORY_MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Compression & Spreadsheet Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#171A2E]">
                Foto Kenangan ({photos.length}/{FIELD_LIMITS.PHOTOS_MAX_COUNT})
              </span>
              <span className="text-[11px] text-[#646B84]">
                Otomatis dikompresi &amp; disimpan ke Spreadsheet
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                dragActive
                  ? 'border-[#4F5BD5] bg-[#4F5BD5]/5'
                  : 'border-[#DCE1F0] bg-[#F9FAFD]'
              }`}
            >
              <input
                id="photo-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="photo-upload-input"
                className="inline-flex flex-col items-center cursor-pointer"
              >
                {compressing ? (
                  <Loader2 className="w-7 h-7 text-[#4F5BD5] animate-spin mb-2" />
                ) : (
                  <Upload className="w-7 h-7 text-[#4F5BD5] mb-2" />
                )}
                <span className="text-xs font-semibold text-[#171A2E]">
                  {compressing
                    ? 'Mengompresi foto agar hemat ruang...'
                    : 'Klik untuk pilih foto atau seret ke sini'}
                </span>
                <span className="text-[11px] text-[#646B84] mt-1">
                  Foto dioptimalkan ke ~40–75 KB sebelum disimpan ke Google Sheets
                </span>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {photos.map((url, idx) => {
                  const approxKB = url.startsWith('data:')
                    ? Math.max(1, Math.round((url.length * 0.75) / 1024))
                    : null;
                  return (
                    <div
                      key={`${idx}-${url.slice(0, 32)}`}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-[#E6E8F0] bg-[#ECEFF8]"
                    >
                      <img
                        src={url}
                        alt={`Lampiran ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 ? (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#1E2342]/85 text-white text-[10px] font-medium">
                          Sampul{approxKB ? ` · ${approxKB}KB` : ''}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(idx)}
                          className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Jadikan Sampul
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        aria-label="Hapus foto"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Story Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="mem-story" className="text-xs font-semibold text-[#171A2E]">
                Cerita &amp; Refleksi <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#646B84] tabular-nums">
                {story.length}/{FIELD_LIMITS.STORY_MAX}
              </span>
            </div>
            <textarea
              id="mem-story"
              required
              rows={5}
              maxLength={FIELD_LIMITS.STORY_MAX}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tuliskan cerita lengkap tentang apa yang terjadi, siapa saja yang hadir, dan perasaan Anda saat itu..."
              className="w-full p-3.5 rounded-xl border border-[#E6E8F0] text-sm text-[#171A2E] leading-relaxed focus:outline-none focus:border-[#4F5BD5]"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#171A2E]">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#4F5BD5] focus:ring-[#4F5BD5]"
              />
              <Sparkles className="w-3.5 h-3.5 text-[#4F5BD5]" />
              <span>Tampilkan di Timeline Perjalanan Hidup</span>
            </label>

            <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#171A2E]">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-rose-600 focus:ring-rose-600"
              />
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Tandai sebagai Kenangan Favorit</span>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E6E8F0] bg-[#F9FAFD] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E6E8F0] bg-white hover:bg-[#F6F7FB] text-xs font-semibold text-[#171A2E] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || compressing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2342] hover:bg-[#2A315A] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            <ImagePlus className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : initialMemory ? 'Simpan Perubahan' : 'Simpan Kenangan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
