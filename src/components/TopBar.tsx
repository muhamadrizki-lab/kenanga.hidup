import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  FileSpreadsheet,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { formatIndonesianDate } from '../lib/validation';
import { Memory, NavSection, UserProfile } from '../types/memoria';

interface TopBarProps {
  activeSection: NavSection;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  throwbackMemories: Memory[];
  onOpenMemory: (memory: Memory) => void;
  onOpenSettings: () => void;
  onConnectSheets: () => void;
  onSignOut: () => void;
  onOpenMobileMenu: () => void;
  profile: UserProfile | null;
  sheetsConnected: boolean;
  sheetsConnecting: boolean;
}

const SECTION_TITLES: Record<NavSection, string> = {
  beranda: 'Beranda',
  timeline: 'Timeline Perjalanan Hidup',
  galeri: 'Galeri Foto & Album',
  cerita: 'Jurnal Cerita',
  kategori: 'Kategori & Koleksi',
  statistik: 'Statistik Kenangan',
  pengaturan: 'Pengaturan Jurnal',
};

export function TopBar({
  activeSection,
  searchQuery,
  onSearchChange,
  throwbackMemories,
  onOpenMemory,
  onOpenSettings,
  onConnectSheets,
  onSignOut,
  onOpenMobileMenu,
  profile,
  sheetsConnected,
  sheetsConnecting,
}: TopBarProps) {
  const [reminderOpen, setReminderOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const reminderRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (reminderRef.current && !reminderRef.current.contains(e.target as Node)) {
        setReminderOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const initials = (profile?.displayName || 'M')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[#F6F7FB]/90 backdrop-blur-md border-b border-[#E6E8F0] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
      {/* Zone 1: Menu toggle (mobile) + Section Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka navigasi"
          className="lg:hidden p-2 rounded-lg text-[#1E2342] hover:bg-white border border-transparent hover:border-[#E6E8F0] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-[#171A2E] truncate whitespace-nowrap">
          {SECTION_TITLES[activeSection]}
        </span>
      </div>

      {/* Zone 2: Live Search Input */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#646B84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul kenangan, cerita, atau lokasi..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-[#E6E8F0] text-sm text-[#171A2E] placeholder:text-[#8890A8] focus:outline-none focus:border-[#4F5BD5] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#646B84] hover:text-[#171A2E] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Optional Sheets Sync, Reminders & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {!sheetsConnected && (
          <button
            type="button"
            onClick={onConnectSheets}
            disabled={sheetsConnecting}
            className="hidden md:inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-[#E6E8F0] hover:border-emerald-400 text-xs font-semibold text-[#171A2E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{sheetsConnecting ? 'Menghubungkan...' : 'Sync Spreadsheet'}</span>
          </button>
        )}

        {/* Throwback Reminder Bell */}
        <div className="relative" ref={reminderRef}>
          <button
            type="button"
            onClick={() => setReminderOpen((v) => !v)}
            aria-label="Pengingat kenangan"
            className="relative w-10 h-10 rounded-xl bg-white border border-[#E6E8F0] flex items-center justify-center text-[#1E2342] hover:border-[#4F5BD5]/40 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {throwbackMemories.length > 0 && profile?.reminderFrequency !== 'off' && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D97706] text-white text-[10px] font-semibold tabular-nums flex items-center justify-center">
                {throwbackMemories.length}
              </span>
            )}
          </button>

          {reminderOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E6E8F0] shadow-xl p-4 z-40">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <h3 className="text-sm font-semibold text-[#171A2E]">
                    Pengingat Kenangan
                  </h3>
                </div>
                <span className="text-xs text-[#646B84]">
                  {profile?.reminderFrequency === 'daily'
                    ? 'Harian'
                    : profile?.reminderFrequency === 'weekly'
                    ? 'Mingguan'
                    : 'Nonaktif'}
                </span>
              </div>

              {profile?.reminderFrequency === 'off' ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-[#646B84]">
                    Pengingat kenangan sedang dimatikan.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderOpen(false);
                      onOpenSettings();
                    }}
                    className="mt-2 text-xs font-semibold text-[#4F5BD5] hover:underline cursor-pointer"
                  >
                    Aktifkan di Pengaturan
                  </button>
                </div>
              ) : throwbackMemories.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#646B84]">
                  Tambahkan lebih banyak kenangan agar MEMORIA dapat menghadirkan kilas balik untuk Anda.
                </div>
              ) : (
                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto">
                  {throwbackMemories.map((mem) => (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => {
                        setReminderOpen(false);
                        onOpenMemory(mem);
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F6F7FB] text-left transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#ECEFF8] shrink-0">
                        {mem.photos[0] ? (
                          <img
                            src={mem.photos[0]}
                            alt={mem.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#171A2E] truncate">
                          {mem.title}
                        </p>
                        <p className="text-[11px] text-[#646B84] mt-0.5 truncate">
                          {formatIndonesianDate(mem.date)} · {mem.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Profil akun"
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl bg-white border border-[#E6E8F0] hover:border-[#4F5BD5]/40 transition-colors cursor-pointer"
          >
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#1E2342] text-white text-xs font-semibold flex items-center justify-center">
                {initials}
              </div>
            )}
            <span className="hidden md:inline text-xs font-medium text-[#171A2E] max-w-[120px] truncate">
              {profile?.displayName || 'Jurnal Saya'}
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E6E8F0] shadow-xl py-2 z-40">
              <div className="px-4 py-2.5 border-b border-[#E6E8F0]">
                <p className="text-sm font-semibold text-[#171A2E] truncate">
                  {profile?.displayName}
                </p>
                <p className="text-xs text-[#646B84] truncate">
                  {sheetsConnected ? profile?.email : 'Mode Langsung (Penyimpanan Lokal)'}
                </p>
              </div>
              {!sheetsConnected && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onConnectSheets();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Hubungkan Google Spreadsheet</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#171A2E] hover:bg-[#F6F7FB] cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#646B84]" />
                <span>Pengaturan Jurnal</span>
              </button>
              {sheetsConnected && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Putuskan Google Sheets</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
