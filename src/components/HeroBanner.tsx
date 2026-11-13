import { useState } from 'react';
import { BookOpen, Calendar, Check, Image as ImageIcon, Pencil, Plus, X } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../lib/sampleAssets';
import { UserProfile } from '../types/memoria';

interface HeroBannerProps {
  profile: UserProfile | null;
  totalMemories: number;
  totalPhotos: number;
  totalStories: number;
  onNewMemory: () => void;
  onUpdateTitle: (title: string, subtitle: string) => Promise<void>;
}

export function HeroBanner({
  profile,
  totalMemories,
  totalPhotos,
  totalStories,
  onNewMemory,
  onUpdateTitle,
}: HeroBannerProps) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(profile?.journalTitle || 'Kenangan Hidupku');
  const [subtitleDraft, setSubtitleDraft] = useState(
    profile?.journalSubtitle || 'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.'
  );
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setTitleDraft(profile?.journalTitle || 'Kenangan Hidupku');
    setSubtitleDraft(
      profile?.journalSubtitle || 'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.'
    );
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateTitle(titleDraft, subtitleDraft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative rounded-2xl overflow-hidden bg-[#1E2342] text-white min-h-[220px] sm:min-h-[248px] flex flex-col justify-end">
      <img
        src={HERO_BANNER_IMAGE}
        alt="Latar belakang perjalanan hidup"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#131730]/92 via-[#191E3C]/70 to-[#131730]/30" />

      <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          {editing ? (
            <div className="space-y-3 bg-[#131730]/80 backdrop-blur-md p-4 rounded-xl border border-white/15">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/25 text-white font-display text-2xl focus:outline-none focus:border-white"
                placeholder="Judul jurnal Anda"
              />
              <input
                type="text"
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                maxLength={220}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/25 text-white text-sm focus:outline-none focus:border-white"
                placeholder="Deskripsi singkat perjalanan Anda"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B67E5] hover:bg-[#4F5BD5] text-xs font-semibold text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white [text-wrap:balance]">
                  {profile?.journalTitle || 'Kenangan Hidupku'}
                </h1>
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label="Edit judul jurnal"
                  title="Edit judul jurnal"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/85 hover:text-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-xl">
                {profile?.journalSubtitle ||
                  'Kumpulan foto, cerita, dan perjalanan yang membentuk siapa aku hari ini.'}
              </p>
            </>
          )}

          {/* Tabular Summary Metrics */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#131730]/65 backdrop-blur-md border border-white/15">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <span className="block text-[11px] text-white/70 leading-none">
                  Total Kenangan
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-white leading-tight">
                  {totalMemories}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#131730]/65 backdrop-blur-md border border-white/15">
              <ImageIcon className="w-4 h-4 text-indigo-300 shrink-0" />
              <div>
                <span className="block text-[11px] text-white/70 leading-none">
                  Total Foto
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-white leading-tight">
                  {totalPhotos}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#131730]/65 backdrop-blur-md border border-white/15">
              <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <span className="block text-[11px] text-white/70 leading-none">
                  Total Cerita
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-white leading-tight">
                  {totalStories}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onNewMemory}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#1E2342] hover:bg-amber-50 font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Abadikan Momen Baru</span>
          </button>
        </div>
      </div>
    </section>
  );
}
