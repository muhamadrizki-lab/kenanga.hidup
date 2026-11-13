import {
  BarChart3,
  BookText,
  Camera,
  Clock,
  FolderKanban,
  Home,
  Images,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { NavSection } from '../types/memoria';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onNewMemory: () => void;
  quote: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof Home }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'galeri', label: 'Galeri Foto', icon: Images },
  { id: 'cerita', label: 'Cerita', icon: BookText },
  { id: 'kategori', label: 'Kategori', icon: FolderKanban },
  { id: 'statistik', label: 'Statistik', icon: BarChart3 },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  onNewMemory,
  quote,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-[#23294B] via-[#2B325B] to-[#3B4272] text-white w-[256px] shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSelectSection('beranda');
              onCloseMobile();
            }}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-semibold tracking-tight text-white block leading-tight">
                MEMORIA
              </span>
              <span className="text-[11px] text-white/70 block">
                Jurnal &amp; Cerita Hidup
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary CTA */}
        <div className="px-4 mb-5">
          <button
            type="button"
            onClick={() => {
              onNewMemory();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5B67E5] hover:bg-[#4F5BD5] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tulis Kenangan</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Menu utama" className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/16 text-white shadow-sm'
                    : 'text-white/75 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Polaroid Motif & Personal Quote */}
      <div className="px-6 py-7 border-t border-white/10">
        <div className="flex justify-center mb-4" aria-hidden="true">
          <div className="relative w-24 h-14">
            <div className="absolute left-1 top-1 w-10 h-12 rounded-md bg-white/15 border border-white/20 -rotate-12" />
            <div className="absolute left-7 top-0 w-10 h-12 rounded-md bg-white/25 border border-white/30 rotate-2" />
            <div className="absolute right-1 top-1.5 w-10 h-12 rounded-md bg-white/15 border border-white/20 rotate-12" />
          </div>
        </div>
        <p className="text-center text-xs leading-relaxed text-white/80 font-display italic">
          “{quote || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.'}”
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F1326]/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
