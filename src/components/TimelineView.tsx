import { useMemo, useState } from 'react';
import { Calendar, MapPin, Pencil, Plus, Sparkles } from 'lucide-react';
import { formatIndonesianDate, MEMORY_CATEGORIES } from '../lib/validation';
import { Memory, MemoryCategory } from '../types/memoria';

interface TimelineViewProps {
  memories: Memory[];
  onOpenMemory: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void;
  onNewMemory: () => void;
}

export function TimelineView({
  memories,
  onOpenMemory,
  onEditMemory,
  onNewMemory,
}: TimelineViewProps) {
  const [onlyMilestones, setOnlyMilestones] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | MemoryCategory>('Semua');

  const filtered = useMemo(() => {
    return memories
      .filter((m) => (!onlyMilestones ? true : m.isMilestone))
      .filter((m) => (selectedCategory === 'Semua' ? true : m.category === selectedCategory))
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [memories, onlyMilestones, selectedCategory]);

  const groupedByYear = useMemo(() => {
    const map = new Map<number, Memory[]>();
    filtered.forEach((m) => {
      const yr = m.year || Number(m.date.slice(0, 4));
      const existing = map.get(yr) || [];
      existing.push(m);
      map.set(yr, existing);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {(['Semua', ...MEMORY_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#1E2342] text-white'
                  : 'bg-[#F6F7FB] text-[#4E556F] hover:text-[#171A2E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setOnlyMilestones((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              onlyMilestones
                ? 'border-[#4F5BD5] bg-[#4F5BD5]/10 text-[#4F5BD5]'
                : 'border-[#E6E8F0] bg-white text-[#4E556F] hover:text-[#171A2E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hanya Tonggak Penting</span>
          </button>

          <button
            type="button"
            onClick={onNewMemory}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F5BD5] hover:bg-[#434EC0] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Momen</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {groupedByYear.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-12 text-center">
          <p className="font-display text-lg font-semibold text-[#171A2E]">
            Belum ada kenangan pada filter ini
          </p>
          <p className="mt-1.5 text-sm text-[#646B84]">
            Ubah filter kategori atau mulai dokumentasikan momen baru ke timeline hidup Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByYear.map(([year, items]) => (
            <section key={year} className="relative">
              <div className="flex items-center gap-4 mb-5">
                <span className="font-mono text-2xl font-semibold tabular-nums text-[#1E2342]">
                  {year}
                </span>
                <div className="h-px flex-1 bg-[#E6E8F0]" />
                <span className="text-xs text-[#646B84] tabular-nums">
                  {items.length} kenangan
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-[#D6DCEB]">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="relative bg-white rounded-2xl border border-[#E6E8F0] p-5 hover:border-[#C5CBE3] transition-colors flex flex-col md:flex-row gap-5"
                  >
                    {/* Timeline Node */}
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[22px] sm:-left-[30px] top-7 w-3.5 h-3.5 rounded-full border-2 border-[#F6F7FB] ${
                        item.isMilestone ? 'bg-[#4F5BD5]' : 'bg-[#94A3B8]'
                      }`}
                    />

                    {/* Thumbnail */}
                    {item.photos[0] && (
                      <div
                        onClick={() => onOpenMemory(item)}
                        className="w-full md:w-52 aspect-[4/3] rounded-xl overflow-hidden bg-[#ECEFF8] shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#646B84]">
                            <span className="font-semibold text-[#4F5BD5]">{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatIndonesianDate(item.date)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.location}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onEditMemory(item)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#646B84] hover:text-[#171A2E] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>

                        <h3
                          onClick={() => onOpenMemory(item)}
                          className="mt-2 font-display text-xl font-semibold text-[#171A2E] hover:text-[#4F5BD5] transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm text-[#4E556F] leading-relaxed line-clamp-3">
                          {item.story}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0F2F8] flex items-center justify-between">
                        <span className="text-xs text-[#646B84] tabular-nums">
                          {item.photos.length} foto · Nuansa {item.mood}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenMemory(item)}
                          className="text-xs font-semibold text-[#4F5BD5] hover:underline cursor-pointer"
                        >
                          Baca Cerita Lengkap
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
