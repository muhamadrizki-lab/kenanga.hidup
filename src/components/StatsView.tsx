import { useMemo } from 'react';
import { Award, BookOpen, Heart, Image as ImageIcon, MapPin } from 'lucide-react';
import { MEMORY_CATEGORIES, MEMORY_MOODS } from '../lib/validation';
import { Memory } from '../types/memoria';

interface StatsViewProps {
  memories: Memory[];
}

export function StatsView({ memories }: StatsViewProps) {
  const stats = useMemo(() => {
    const totalPhotos = memories.reduce((sum, m) => sum + (m.photos?.length || 0), 0);
    const totalWords = memories.reduce(
      (sum, m) => sum + m.story.trim().split(/\s+/).filter(Boolean).length,
      0
    );
    const totalFavorites = memories.filter((m) => m.isFavorite).length;
    const totalMilestones = memories.filter((m) => m.isMilestone).length;

    const byYearMap = new Map<number, number>();
    memories.forEach((m) => {
      const yr = m.year || Number(m.date.slice(0, 4));
      byYearMap.set(yr, (byYearMap.get(yr) || 0) + 1);
    });
    const byYear = Array.from(byYearMap.entries()).sort((a, b) => a[0] - b[0]);
    const maxYearCount = Math.max(1, ...byYear.map(([, c]) => c));

    const byCategory = MEMORY_CATEGORIES.map((cat) => ({
      name: cat,
      count: memories.filter((m) => m.category === cat).length,
    }));

    const byMood = MEMORY_MOODS.map((mood) => ({
      name: mood,
      count: memories.filter((m) => m.mood === mood).length,
    })).filter((item) => item.count > 0);

    const locationMap = new Map<string, number>();
    memories.forEach((m) => {
      const loc = m.location.trim();
      if (loc) locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
    });
    const topLocations = Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      totalPhotos,
      totalWords,
      totalFavorites,
      totalMilestones,
      byYear,
      maxYearCount,
      byCategory,
      byMood,
      topLocations,
    };
  }, [memories]);

  return (
    <div className="space-y-6">
      {/* Top Tabular KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5">
          <div className="flex items-center justify-between text-xs text-[#646B84]">
            <span>Total Kenangan</span>
            <Award className="w-4 h-4 text-[#4F5BD5]" />
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#171A2E]">
            {memories.length}
          </p>
          <p className="mt-1 text-[11px] text-[#646B84] tabular-nums">
            {stats.totalMilestones} tonggak timeline
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5">
          <div className="flex items-center justify-between text-xs text-[#646B84]">
            <span>Foto Tersimpan</span>
            <ImageIcon className="w-4 h-4 text-[#4F5BD5]" />
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#171A2E]">
            {stats.totalPhotos}
          </p>
          <p className="mt-1 text-[11px] text-[#646B84] tabular-nums">
            Rata-rata{' '}
            {memories.length ? (stats.totalPhotos / memories.length).toFixed(1) : '0.0'}{' '}
            foto/momen
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5">
          <div className="flex items-center justify-between text-xs text-[#646B84]">
            <span>Total Kata Ditulis</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#171A2E]">
            {stats.totalWords}
          </p>
          <p className="mt-1 text-[11px] text-[#646B84]">
            Narasi jurnal pribadi
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5">
          <div className="flex items-center justify-between text-xs text-[#646B84]">
            <span>Momen Favorit</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#171A2E]">
            {stats.totalFavorites}
          </p>
          <p className="mt-1 text-[11px] text-[#646B84] tabular-nums">
            {memories.length
              ? Math.round((stats.totalFavorites / memories.length) * 100)
              : 0}
            % dari seluruh arsip
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memories per Year */}
        <section className="bg-white rounded-2xl border border-[#E6E8F0] p-6">
          <h2 className="text-base font-semibold text-[#171A2E]">
            Kenangan per Tahun
          </h2>
          <p className="text-xs text-[#646B84] mt-0.5 mb-5">
            Distribusi jumlah momen yang terdokumentasi setiap tahun.
          </p>

          {stats.byYear.length === 0 ? (
            <p className="text-xs text-[#646B84] py-8 text-center">Belum ada data tahunan.</p>
          ) : (
            <div className="space-y-3">
              {stats.byYear.map(([yr, count]) => (
                <div key={yr} className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tabular-nums text-[#171A2E] w-12">
                    {yr}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[#F0F2F8] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4F5BD5]"
                      style={{ width: `${(count / stats.maxYearCount) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#4E556F] w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Category Distribution */}
        <section className="bg-white rounded-2xl border border-[#E6E8F0] p-6">
          <h2 className="text-base font-semibold text-[#171A2E]">
            Distribusi Kategori
          </h2>
          <p className="text-xs text-[#646B84] mt-0.5 mb-5">
            Tema perjalanan hidup yang paling sering Anda abadikan.
          </p>

          <div className="space-y-3">
            {stats.byCategory.map((cat) => {
              const pct = memories.length
                ? Math.round((cat.count / memories.length) * 100)
                : 0;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#171A2E] w-24 shrink-0">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[#F0F2F8] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1E2342]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#4E556F] w-14 text-right">
                    {cat.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mood Reflections */}
        <section className="bg-white rounded-2xl border border-[#E6E8F0] p-6">
          <h2 className="text-base font-semibold text-[#171A2E]">
            Nuansa Perasaan Dominan
          </h2>
          <p className="text-xs text-[#646B84] mt-0.5 mb-5">
            Rekam jejak emosi di setiap cerita yang Anda tulis.
          </p>

          {stats.byMood.length === 0 ? (
            <p className="text-xs text-[#646B84]">Belum ada catatan nuansa perasaan.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.byMood.map((item) => (
                <div
                  key={item.name}
                  className="p-3.5 rounded-xl border border-[#E6E8F0] bg-[#F9FAFD]"
                >
                  <p className="text-xs font-medium text-[#646B84]">{item.name}</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#171A2E]">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Locations */}
        <section className="bg-white rounded-2xl border border-[#E6E8F0] p-6">
          <h2 className="text-base font-semibold text-[#171A2E]">
            Lokasi Kenangan
          </h2>
          <p className="text-xs text-[#646B84] mt-0.5 mb-5">
            Tempat-tempat yang menjadi saksi perjalanan hidup Anda.
          </p>

          {stats.topLocations.length === 0 ? (
            <p className="text-xs text-[#646B84]">Belum ada lokasi tercatat.</p>
          ) : (
            <div className="divide-y divide-[#F0F2F8]">
              {stats.topLocations.map(([loc, count]) => (
                <div key={loc} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#4F5BD5] shrink-0" />
                    <span className="text-xs font-medium text-[#171A2E] truncate">
                      {loc}
                    </span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#646B84] shrink-0">
                    {count} momen
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
