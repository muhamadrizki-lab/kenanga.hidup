import { useMemo, useState } from 'react';
import { FolderPlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { formatIndonesianDate, MEMORY_CATEGORIES } from '../lib/validation';
import { Album, Memory, MemoryCategory } from '../types/memoria';

interface GalleryViewProps {
  memories: Memory[];
  albums: Album[];
  onOpenPhotoMemory: (memory: Memory, photoIndex: number) => void;
  onOpenNewAlbum: () => void;
  onDeleteAlbum: (albumId: string) => Promise<void>;
}

export function GalleryView({
  memories,
  albums,
  onOpenPhotoMemory,
  onOpenNewAlbum,
  onDeleteAlbum,
}: GalleryViewProps) {
  const [activeAlbumId, setActiveAlbumId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | MemoryCategory>('Semua');
  const [yearFilter, setYearFilter] = useState<number>(0);

  const availableYears = useMemo(() => {
    const yrs = new Set<number>();
    memories.forEach((m) => yrs.add(m.year || Number(m.date.slice(0, 4))));
    return Array.from(yrs).sort((a, b) => b - a);
  }, [memories]);

  const activeAlbum = albums.find((a) => a.id === activeAlbumId) || null;

  const photoItems = useMemo(() => {
    const effectiveCategory = activeAlbum ? activeAlbum.categoryFilter : categoryFilter;
    const effectiveYear = activeAlbum ? activeAlbum.yearFilter : yearFilter;

    const list: { src: string; memory: Memory; photoIndex: number }[] = [];
    memories.forEach((mem) => {
      if (effectiveCategory !== 'Semua' && mem.category !== effectiveCategory) return;
      if (effectiveYear !== 0 && mem.year !== effectiveYear) return;
      (mem.photos || []).forEach((src, idx) => {
        list.push({ src, memory: mem, photoIndex: idx });
      });
    });
    return list;
  }, [memories, activeAlbum, categoryFilter, yearFilter]);

  return (
    <div className="space-y-6">
      {/* Digital Albums Bar */}
      <section className="bg-white rounded-2xl border border-[#E6E8F0] p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#171A2E]">
              Album Digital Berdasarkan Kategori &amp; Tahun
            </h2>
            <p className="text-xs text-[#646B84] mt-0.5">
              Kelompokkan foto kenangan Anda menjadi album tematik.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewAlbum}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2342] hover:bg-[#2A315A] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Buat Album</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveAlbumId('all')}
            className={`px-4 py-2.5 rounded-xl border text-left transition-colors cursor-pointer shrink-0 ${
              activeAlbumId === 'all'
                ? 'border-[#4F5BD5] bg-[#4F5BD5]/8 text-[#171A2E]'
                : 'border-[#E6E8F0] bg-[#F9FAFD] text-[#4E556F] hover:bg-white'
            }`}
          >
            <span className="block text-xs font-semibold whitespace-nowrap">Semua Foto</span>
            <span className="block text-[11px] text-[#646B84] tabular-nums mt-0.5">
              {memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0)} foto
            </span>
          </button>

          {albums.map((alb) => (
            <div
              key={alb.id}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors shrink-0 ${
                activeAlbumId === alb.id
                  ? 'border-[#4F5BD5] bg-[#4F5BD5]/8'
                  : 'border-[#E6E8F0] bg-[#F9FAFD] hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveAlbumId(alb.id)}
                className="text-left cursor-pointer"
              >
                <span className="block text-xs font-semibold text-[#171A2E] whitespace-nowrap">
                  {alb.name}
                </span>
                <span className="block text-[11px] text-[#646B84] whitespace-nowrap mt-0.5 tabular-nums">
                  {alb.categoryFilter} · {alb.yearFilter === 0 ? 'Semua Tahun' : alb.yearFilter}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeAlbumId === alb.id) setActiveAlbumId('all');
                  onDeleteAlbum(alb.id);
                }}
                aria-label={`Hapus album ${alb.name}`}
                className="p-1 rounded-lg text-[#646B84] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Bar (when Viewing All Photos) */}
      {activeAlbumId === 'all' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['Semua', ...MEMORY_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-[#4F5BD5] text-white'
                    : 'bg-white border border-[#E6E8F0] text-[#4E556F] hover:text-[#171A2E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter tahun"
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-[#E6E8F0] bg-white text-xs font-medium text-[#171A2E] tabular-nums focus:outline-none focus:border-[#4F5BD5] shrink-0"
          >
            <option value={0}>Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Photo Grid */}
      {photoItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-12 text-center">
          <ImageIcon className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
          <p className="font-display text-lg font-semibold text-[#171A2E]">
            Belum ada foto di tampilan ini
          </p>
          <p className="mt-1 text-sm text-[#646B84]">
            Unggah foto saat menulis kenangan baru untuk melengkapi galeri Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoItems.map((item, idx) => (
            <button
              key={`${item.memory.id}-${item.photoIndex}-${idx}`}
              type="button"
              onClick={() => onOpenPhotoMemory(item.memory, item.photoIndex)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#ECEFF8] border border-[#E6E8F0] text-left cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.memory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                <p className="text-xs font-semibold truncate">{item.memory.title}</p>
                <p className="text-[11px] text-white/80 tabular-nums truncate">
                  {formatIndonesianDate(item.memory.date)} · {item.memory.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
