import { useState } from 'react';
import { Calendar, Heart, Image as ImageIcon, MapPin } from 'lucide-react';
import { formatIndonesianDate } from '../lib/validation';
import { Memory } from '../types/memoria';

interface MemoryCardProps {
  memory: Memory;
  onOpen: (memory: Memory) => void;
  onToggleFavorite: (memory: Memory) => void;
}

export function MemoryCard({ memory, onOpen, onToggleFavorite }: MemoryCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverPhoto = memory.photos[0];
  const extraCount = Math.max(0, memory.photos.length - 3);
  const thumbPhotos = memory.photos.slice(0, 3);

  return (
    <article
      className="group bg-white rounded-2xl border border-[#E6E8F0] overflow-hidden flex flex-col hover:border-[#C5CBE3] transition-colors cursor-pointer"
      onClick={() => onOpen(memory)}
    >
      {/* 4:3 Cover Image Container */}
      <div className="relative aspect-[4/3] bg-[#ECEFF8] overflow-hidden">
        {coverPhoto && !imgError ? (
          <img
            src={coverPhoto}
            alt={memory.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8ECF8] to-[#D6DDF2] flex flex-col items-center justify-center p-4 text-[#4E556F]">
            <ImageIcon className="w-7 h-7 mb-2 opacity-60" />
            <span className="text-xs font-medium text-center line-clamp-1">{memory.title}</span>
          </div>
        )}

        {/* Favorite Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(memory);
          }}
          aria-label={memory.isFavorite ? 'Hapus dari favorit' : 'Tandai favorit'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
            memory.isFavorite
              ? 'bg-rose-600 text-white'
              : 'bg-black/35 text-white hover:bg-black/55'
          }`}
        >
          <Heart className={`w-4 h-4 ${memory.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#646B84] mb-2">
            <span className="font-semibold text-[#4F5BD5]">{memory.category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar className="w-3.5 h-3.5 opacity-75" />
              {formatIndonesianDate(memory.date)}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold text-[#171A2E] leading-snug line-clamp-1 group-hover:text-[#4F5BD5] transition-colors">
            {memory.title}
          </h3>

          <p className="mt-1.5 text-[13px] text-[#4E556F] leading-relaxed line-clamp-2">
            {memory.excerpt}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#646B84]">
            <MapPin className="w-3.5 h-3.5 shrink-0 opacity-75" />
            <span className="truncate">{memory.location}</span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {thumbPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F2F8]">
            {thumbPhotos.map((src, idx) => {
              const isLastWithMore = idx === 2 && extraCount > 0;
              return (
                <div
                  key={`${memory.id}-thumb-${idx}`}
                  className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[#ECEFF8]"
                >
                  <img
                    src={src}
                    alt={`${memory.title} foto ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isLastWithMore && (
                    <div className="absolute inset-0 bg-[#131730]/65 flex items-center justify-center text-white font-mono text-xs font-semibold tabular-nums">
                      +{extraCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
