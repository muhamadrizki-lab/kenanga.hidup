import { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { FIELD_LIMITS, MEMORY_CATEGORIES } from '../lib/validation';
import { MemoryCategory } from '../types/memoria';

interface AlbumModalProps {
  open: boolean;
  availableYears: number[];
  defaultCoverPhoto: string;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    categoryFilter: 'Semua' | MemoryCategory;
    yearFilter: number;
    coverPhoto: string;
  }) => Promise<void>;
}

export function AlbumModal({
  open,
  availableYears,
  defaultCoverPhoto,
  onClose,
  onCreate,
}: AlbumModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | MemoryCategory>('Semua');
  const [yearFilter, setYearFilter] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama album wajib diisi.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate({
        name,
        description,
        categoryFilter,
        yearFilter,
        coverPhoto: defaultCoverPhoto,
      });
      setName('');
      setDescription('');
      setCategoryFilter('Semua');
      setYearFilter(0);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat album.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12162C]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-[#E6E8F0] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E6E8F0] flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#171A2E]">
            Buat Album Digital Baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-xl text-[#646B84] hover:text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="alb-name" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
              Nama Album <span className="text-red-500">*</span>
            </label>
            <input
              id="alb-name"
              type="text"
              required
              maxLength={FIELD_LIMITS.ALBUM_NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pendakian Nusantara 2026"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] text-sm focus:outline-none focus:border-[#4F5BD5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="alb-cat" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Kategori
              </label>
              <select
                id="alb-cat"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'Semua' | MemoryCategory)}
                className="w-full h-11 px-3 rounded-xl border border-[#E6E8F0] bg-white text-sm focus:outline-none focus:border-[#4F5BD5]"
              >
                <option value="Semua">Semua Kategori</option>
                {MEMORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alb-year" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
                Tahun
              </label>
              <select
                id="alb-year"
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#E6E8F0] bg-white text-sm tabular-nums focus:outline-none focus:border-[#4F5BD5]"
              >
                <option value={0}>Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="alb-desc" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
              Deskripsi Singkat
            </label>
            <textarea
              id="alb-desc"
              rows={3}
              maxLength={FIELD_LIMITS.ALBUM_DESC_MAX}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tema album digital ini..."
              className="w-full p-3.5 rounded-xl border border-[#E6E8F0] text-sm focus:outline-none focus:border-[#4F5BD5]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E6E8F0] text-xs font-semibold text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2342] hover:bg-[#2A315A] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{saving ? 'Membuat...' : 'Buat Album'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
