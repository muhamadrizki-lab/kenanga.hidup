import { useState } from 'react';
import { BookOpen, Calendar, Heart, MapPin, Pencil, Plus } from 'lucide-react';
import { formatIndonesianDate } from '../lib/validation';
import { Memory } from '../types/memoria';

interface StoriesViewProps {
  memories: Memory[];
  onEditMemory: (memory: Memory) => void;
  onToggleFavorite: (memory: Memory) => void;
  onNewMemory: () => void;
}

export function StoriesView({
  memories,
  onEditMemory,
  onToggleFavorite,
  onNewMemory,
}: StoriesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(memories[0]?.id || null);

  const selectedMemory =
    memories.find((m) => m.id === selectedId) || memories[0] || null;

  if (memories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E6E8F0] p-12 text-center">
        <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
        <p className="font-display text-lg font-semibold text-[#171A2E]">
          Jurnal cerita masih kosong
        </p>
        <p className="mt-1 text-sm text-[#646B84] mb-5">
          Mulai tulis cerita perjalanan hidup pertama Anda.
        </p>
        <button
          type="button"
          onClick={onNewMemory}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2342] text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Cerita</span>
        </button>
      </div>
    );
  }

  const wordCount = selectedMemory
    ? selectedMemory.story.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Story Index */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E6E8F0] divide-y divide-[#F0F2F8] overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-[#F9FAFD]">
          <span className="text-xs font-semibold text-[#171A2E] tabular-nums">
            {memories.length} Catatan Cerita
          </span>
          <button
            type="button"
            onClick={onNewMemory}
            className="text-xs font-semibold text-[#4F5BD5] hover:underline cursor-pointer"
          >
            + Cerita Baru
          </button>
        </div>

        <div className="max-h-[680px] overflow-y-auto divide-y divide-[#F0F2F8]">
          {memories.map((mem) => {
            const active = selectedMemory?.id === mem.id;
            return (
              <button
                key={mem.id}
                type="button"
                onClick={() => setSelectedId(mem.id)}
                className={`w-full p-4 text-left transition-colors cursor-pointer ${
                  active ? 'bg-[#4F5BD5]/8' : 'hover:bg-[#F9FAFD]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#646B84]">
                  <span className="font-semibold text-[#4F5BD5]">{mem.category}</span>
                  <span className="tabular-nums">{formatIndonesianDate(mem.date)}</span>
                </div>
                <h3 className="mt-1 font-display text-base font-semibold text-[#171A2E] line-clamp-1">
                  {mem.title}
                </h3>
                <p className="mt-1 text-xs text-[#646B84] line-clamp-2 leading-relaxed">
                  {mem.excerpt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Editorial Reader */}
      {selectedMemory && (
        <article className="lg:col-span-8 bg-white rounded-2xl border border-[#E6E8F0] overflow-hidden">
          {selectedMemory.photos[0] && (
            <div className="aspect-[16/8] bg-[#ECEFF8] overflow-hidden">
              <img
                src={selectedMemory.photos[0]}
                alt={selectedMemory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[#F0F2F8]">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[#646B84]">
                <span className="font-semibold text-[#4F5BD5]">{selectedMemory.category}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatIndonesianDate(selectedMemory.date)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedMemory.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{readMinutes} mnt baca</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(selectedMemory)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    selectedMemory.isFavorite
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-[#E6E8F0] text-[#4E556F] hover:text-[#171A2E]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${selectedMemory.isFavorite ? 'fill-current' : ''}`} />
                  <span>{selectedMemory.isFavorite ? 'Favorit' : 'Sukai'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditMemory(selectedMemory)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E8F0] text-xs font-medium text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Cerita</span>
                </button>
              </div>
            </div>

            <h2 className="mt-6 font-display text-3xl font-semibold text-[#171A2E] leading-tight">
              {selectedMemory.title}
            </h2>

            <p className="mt-2 text-xs text-[#646B84]">
              Nuansa hati: {selectedMemory.mood}
            </p>

            <div className="mt-6 text-[16px] leading-[1.8] text-[#282D44] whitespace-pre-line max-w-[68ch]">
              {selectedMemory.story}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
