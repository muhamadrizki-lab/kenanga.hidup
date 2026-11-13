import {
  ArrowRight,
  Award,
  Briefcase,
  Compass,
  GraduationCap,
  Heart,
  Mountain,
  Sparkles,
} from 'lucide-react';
import { formatIndonesianDate } from '../lib/validation';
import { Memory, MemoryCategory } from '../types/memoria';

interface TimelineRailProps {
  memories: Memory[];
  onOpenMemory: (memory: Memory) => void;
  onViewAllTimeline: () => void;
}

function getCategoryIcon(category: MemoryCategory) {
  switch (category) {
    case 'Keluarga':
      return { Icon: Heart, bg: 'bg-rose-50 text-rose-600' };
    case 'Karier':
      return { Icon: Briefcase, bg: 'bg-amber-50 text-amber-700' };
    case 'Travel':
      return { Icon: Compass, bg: 'bg-sky-50 text-sky-600' };
    case 'Pendakian':
      return { Icon: Mountain, bg: 'bg-emerald-50 text-emerald-700' };
    case 'Pencapaian':
      return { Icon: Award, bg: 'bg-indigo-50 text-[#4F5BD5]' };
    default:
      return { Icon: GraduationCap, bg: 'bg-slate-100 text-slate-700' };
  }
}

export function TimelineRail({
  memories,
  onOpenMemory,
  onViewAllTimeline,
}: TimelineRailProps) {
  const milestones = memories
    .filter((m) => m.isMilestone)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const displayList = (milestones.length > 0 ? milestones : memories).slice(0, 7);

  return (
    <aside className="bg-white rounded-2xl border border-[#E6E8F0] p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#F0F2F8]">
          <Sparkles className="w-4 h-4 text-[#4F5BD5] shrink-0" />
          <h2 className="text-base font-semibold text-[#171A2E]">
            Timeline Perjalanan Hidup
          </h2>
        </div>

        {displayList.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#646B84]">
            Belum ada tonggak perjalanan yang dicatat. Tandai kenangan Anda sebagai tonggak timeline.
          </div>
        ) : (
          <div className="relative mt-5 space-y-4">
            {/* Vertical connector line */}
            <div
              className="absolute left-[19px] top-4 bottom-4 w-px bg-[#E6E8F0]"
              aria-hidden="true"
            />

            {displayList.map((item) => {
              const { Icon, bg } = getCategoryIcon(item.category);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenMemory(item)}
                  className="relative w-full flex items-start gap-3.5 text-left group cursor-pointer rounded-xl p-1.5 -mx-1.5 hover:bg-[#F6F7FB] transition-colors"
                >
                  <div
                    className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-xs ${bg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-[#171A2E] truncate group-hover:text-[#4F5BD5] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#646B84] tabular-nums mt-0.5">
                      {formatIndonesianDate(item.date)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-6 mt-6 border-t border-[#F0F2F8]">
        <button
          type="button"
          onClick={onViewAllTimeline}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E6E8F0] hover:border-[#4F5BD5]/40 hover:bg-[#F6F7FB] text-xs font-semibold text-[#171A2E] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>Lihat Timeline Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
