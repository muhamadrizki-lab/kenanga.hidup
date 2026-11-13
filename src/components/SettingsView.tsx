import { useState, useEffect } from 'react';
import { Check, Download, LogOut, Save } from 'lucide-react';
import { FIELD_LIMITS } from '../lib/validation';
import { Memory, ReminderFrequency, UserProfile } from '../types/memoria';

interface SettingsViewProps {
  profile: UserProfile | null;
  memories: Memory[];
  onSaveProfile: (settings: {
    journalTitle: string;
    journalSubtitle: string;
    quote: string;
    reminderFrequency: ReminderFrequency;
  }) => Promise<void>;
  onSignOut: () => void;
}

export function SettingsView({
  profile,
  memories,
  onSaveProfile,
  onSignOut,
}: SettingsViewProps) {
  const [journalTitle, setJournalTitle] = useState(profile?.journalTitle || 'Kenangan Hidupku');
  const [journalSubtitle, setJournalSubtitle] = useState(
    profile?.journalSubtitle || ''
  );
  const [quote, setQuote] = useState(
    profile?.quote || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.'
  );
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>(
    profile?.reminderFrequency || 'weekly'
  );
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setJournalTitle(profile.journalTitle || 'Kenangan Hidupku');
    setJournalSubtitle(profile.journalSubtitle || '');
    setQuote(profile.quote || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.');
    setReminderFrequency(profile.reminderFrequency || 'weekly');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await onSaveProfile({
        journalTitle,
        journalSubtitle,
        quote,
        reminderFrequency,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportArchive = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      journal: {
        title: journalTitle,
        subtitle: journalSubtitle,
        owner: profile?.displayName,
        email: profile?.email,
      },
      memories: memories.map((m) => ({
        title: m.title,
        date: m.date,
        location: m.location,
        category: m.category,
        mood: m.mood,
        story: m.story,
        isMilestone: m.isMilestone,
        isFavorite: m.isFavorite,
        photos: m.photos,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoria-arsip-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E6E8F0] p-6 space-y-5"
      >
        <div>
          <h2 className="text-base font-semibold text-[#171A2E]">
            Personalisasi Jurnal Pribadi
          </h2>
          <p className="text-xs text-[#646B84] mt-0.5">
            Atur judul jurnal, deskripsi beranda, kutipan, dan jadwal pengingat kenangan lama.
          </p>
        </div>

        <div>
          <label htmlFor="set-title" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
            Judul Jurnal
          </label>
          <input
            id="set-title"
            type="text"
            required
            maxLength={FIELD_LIMITS.JOURNAL_TITLE_MAX}
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] text-sm focus:outline-none focus:border-[#4F5BD5]"
          />
        </div>

        <div>
          <label htmlFor="set-subtitle" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
            Deskripsi Beranda
          </label>
          <input
            id="set-subtitle"
            type="text"
            maxLength={FIELD_LIMITS.JOURNAL_SUBTITLE_MAX}
            value={journalSubtitle}
            onChange={(e) => setJournalSubtitle(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] text-sm focus:outline-none focus:border-[#4F5BD5]"
          />
        </div>

        <div>
          <label htmlFor="set-quote" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
            Kutipan Pribadi Sidebar
          </label>
          <input
            id="set-quote"
            type="text"
            maxLength={FIELD_LIMITS.QUOTE_MAX}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] text-sm focus:outline-none focus:border-[#4F5BD5]"
          />
        </div>

        <div>
          <label htmlFor="set-reminder" className="block text-xs font-semibold text-[#171A2E] mb-1.5">
            Frekuensi Pengingat Kenangan Lama (Kilas Balik)
          </label>
          <select
            id="set-reminder"
            value={reminderFrequency}
            onChange={(e) => setReminderFrequency(e.target.value as ReminderFrequency)}
            className="w-full h-11 px-3.5 rounded-xl border border-[#E6E8F0] bg-white text-sm focus:outline-none focus:border-[#4F5BD5]"
          >
            <option value="daily">Pengingat Harian</option>
            <option value="weekly">Pengingat Mingguan</option>
            <option value="off">Nonaktifkan Pengingat</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between gap-4">
          {savedNotice ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="w-4 h-4" />
              Perubahan berhasil disimpan
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2342] hover:bg-[#2A315A] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Export & Account Card */}
      <div className="bg-white rounded-2xl border border-[#E6E8F0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#171A2E]">
            Ekspor Arsip &amp; Akun
          </h3>
          <p className="text-xs text-[#646B84] mt-0.5">
            Masuk sebagai {profile?.displayName} ({profile?.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportArchive}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E6E8F0] bg-white hover:bg-[#F6F7FB] text-xs font-semibold text-[#171A2E] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
