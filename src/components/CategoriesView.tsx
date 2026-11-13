import { Award, Briefcase, Compass, FolderPlus, Heart, Mountain, Sparkles } from 'lucide-react';
import { MEMORY_CATEGORIES } from '../lib/validation';
import { Album, Memory, MemoryCategory } from '../types/memoria';

interface CategoriesViewProps {
  memories: Memory[];
  albums: Album[];
  onSelectCategory: (category: MemoryCategory) => void;
  onOpenNewAlbum: () => void;
}

const CATEGORY_META: Record<
  MemoryCategory,
  { description: string; Icon: typeof Heart; accent: string }
> = {
  Keluarga: {
    description: 'Momen hangat bersama keluarga, orang tua, dan orang terkasih.',
    Icon: Heart,
    accent: 'bg-rose-50 text-rose-600',
  },
  Karier: {
    description: 'Perjalanan pendidikan, pekerjaan pertama, dan pertumbuhan profesional.',
    Icon: Briefcase,
    accent: 'bg-amber-50 text-amber-700',
  },
  Travel: {
    description: 'Jejak langkah menjelajahi kota baru, pantai, dan budaya berbeda.',
    Icon: Compass,
    accent: 'bg-sky-50 text-sky-600',
  },
  Pendakian: {
    description: 'Catatan puncak gunung, jalur menanjak, dan matahari terbit.',
    Icon: Mountain,
    accent: 'bg-emerald-50 text-emerald-700',
  },
  Pencapaian: {
    description: 'Impian yang terwujud dari usaha keras, dedikasi, dan doa.',
    Icon: Award,
    accent: 'bg-indigo-50 text-[#4F5BD5]',
  },
  Lainnya: {
    description: 'Refleksi keseharian dan momen tak terduga yang layak diingat.',
    Icon: Sparkles,
    accent: 'bg-slate-100 text-slate-700',
  },
};

export function CategoriesView({
  memories,
  albums,
  onSelectCategory,
  onOpenNewAlbum,
}: CategoriesViewProps) {
  return (
    <div className="space-y-8">
      {/* Category Grid */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#171A2E]">Kategori Kenangan</h2>
          <p className="text-xs text-[#646B84] mt-0.5">
            Klik kategori mana saja untuk langsung menelusuri kenangan di dalamnya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MEMORY_CATEGORIES.map((category) => {
            const catMemories = memories.filter((m) => m.category === category);
            const photoCount = catMemories.reduce(
              (acc, m) => acc + (m.photos?.length || 0),
              0
            );
            const latestPhoto = catMemories.find((m) => m.photos?.length > 0)?.photos[0];
            const { description, Icon, accent } = CATEGORY_META[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className="group bg-white rounded-2xl border border-[#E6E8F0] hover:border-[#C5CBE3] overflow-hidden text-left transition-colors cursor-pointer flex flex-col"
              >
                <div className="h-32 bg-[#ECEFF8] relative overflow-hidden">
                  {latestPhoto ? (
                    <img
                      src={latestPhoto}
                      alt={category}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#EEF1FA] to-[#E0E6F6]" />
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-display text-lg font-semibold text-[#171A2E] group-hover:text-[#4F5BD5] transition-colors">
                          {category}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums text-[#4E556F]">
                        {catMemories.length} momen
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-[#646B84] leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <p className="mt-4 pt-3 border-t border-[#F0F2F8] text-[11px] text-[#646B84] tabular-nums">
                    {photoCount} foto tersimpan
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Digital Albums */}
      <section className="bg-white rounded-2xl border border-[#E6E8F0] p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#171A2E]">Album Digital Kustom</h2>
            <p className="text-xs text-[#646B84] mt-0.5">
              Album tematik yang dibuat berdasarkan kombinasi kategori dan tahun.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewAlbum}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2342] hover:bg-[#2A315A] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Buat Album</span>
          </button>
        </div>

        {albums.length === 0 ? (
          <p className="text-sm text-[#646B84] py-4">
            Belum ada album digital kustom. Buat album pertama Anda untuk merangkum momen favorit.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((alb) => (
              <div
                key={alb.id}
                className="rounded-xl border border-[#E6E8F0] p-4 bg-[#F9FAFD]"
              >
                <p className="font-display text-base font-semibold text-[#171A2E]">
                  {alb.name}
                </p>
                <p className="text-xs text-[#4F5BD5] mt-0.5 tabular-nums">
                  {alb.categoryFilter} · {alb.yearFilter === 0 ? 'Semua Tahun' : alb.yearFilter}
                </p>
                {alb.description && (
                  <p className="mt-2 text-xs text-[#646B84] leading-relaxed">
                    {alb.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
