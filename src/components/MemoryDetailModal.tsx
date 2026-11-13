import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { formatIndonesianDate } from '../lib/validation';
import { Memory } from '../types/memoria';

interface MemoryDetailModalProps {
  memory: Memory | null;
  initialPhotoIndex?: number;
  onClose: () => void;
  onEdit: (memory: Memory) => void;
  onDelete: (memoryId: string) => Promise<void>;
  onToggleFavorite: (memory: Memory) => void;
}

export function MemoryDetailModal({
  memory,
  initialPhotoIndex = 0,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MemoryDetailModalProps) {
  const [photoIdx, setPhotoIdx] = useState(initialPhotoIndex);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPhotoIdx(initialPhotoIndex);
    setConfirmDelete(false);
  }, [memory, initialPhotoIndex]);

  useEffect(() => {
    if (!memory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (memory.photos.length > 1) {
        if (e.key === 'ArrowRight') {
          setPhotoIdx((i) => (i + 1) % memory.photos.length);
        } else if (e.key === 'ArrowLeft') {
          setPhotoIdx((i) => (i - 1 + memory.photos.length) % memory.photos.length);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [memory, onClose]);

  if (!memory) return null;

  const photos = memory.photos || [];
  const activePhoto = photos[photoIdx] || photos[0];

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(memory.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#101325]/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-memory-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E6E8F0] w-full max-w-4xl max-h-[92vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Photo Viewer / Lightbox */}
        <div className="lg:w-[54%] bg-[#131730] relative flex flex-col justify-between min-h-[260px] lg:min-h-[520px]">
          {activePhoto ? (
            <img
              src={activePhoto}
              alt={memory.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[420px] lg:max-h-[92vh] mx-auto my-auto"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/60 text-sm p-8">
              Tidak ada foto terlampir pada kenangan ini.
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoIdx(idx)}
                    aria-label={`Lihat foto ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === photoIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Narrative & Actions */}
        <div className="lg:w-[46%] flex flex-col max-h-[54vh] lg:max-h-[92vh]">
          <div className="px-6 py-4 border-b border-[#E6E8F0] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#646B84]">
              <span className="font-semibold text-[#4F5BD5]">{memory.category}</span>
              <span aria-hidden="true">·</span>
              <span>Nuansa {memory.mood}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail"
              className="p-2 rounded-xl text-[#646B84] hover:text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h2
              id="detail-memory-title"
              className="font-display text-2xl font-semibold text-[#171A2E] leading-snug"
            >
              {memory.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#646B84]">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Calendar className="w-3.5 h-3.5" />
                {formatIndonesianDate(memory.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {memory.location}
              </span>
              {memory.isMilestone && (
                <span className="inline-flex items-center gap-1 text-[#4F5BD5] font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tonggak Hidup
                </span>
              )}
            </div>

            <div className="mt-6 space-y-4 text-[15px] leading-[1.7] text-[#323850] whitespace-pre-line">
              {memory.story}
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 border-t border-[#E6E8F0] bg-[#F9FAFD]">
            {confirmDelete ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-red-700">
                  Hapus kenangan ini secara permanen?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#E6E8F0] bg-white text-xs font-medium text-[#171A2E] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(memory)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    memory.isFavorite
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-[#E6E8F0] bg-white text-[#171A2E] hover:bg-[#F6F7FB]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${memory.isFavorite ? 'fill-current' : ''}`} />
                  <span>{memory.isFavorite ? 'Favorit' : 'Sukai'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(memory);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E8F0] bg-white hover:bg-[#F6F7FB] text-xs font-semibold text-[#171A2E] cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
