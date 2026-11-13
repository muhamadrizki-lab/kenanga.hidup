import { BookOpen, CalendarClock, Camera, FileSpreadsheet, Sparkles } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../lib/sampleAssets';

interface AuthScreenProps {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
  needsTokenRefresh?: boolean;
  userEmail?: string | null;
}

export function AuthScreen({
  onSignIn,
  loading,
  error,
  needsTokenRefresh = false,
  userEmail = null,
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#171A2E] flex flex-col lg:flex-row">
      {/* Left Narrative Column */}
      <div className="flex-1 flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 lg:py-12 bg-white border-b lg:border-b-0 lg:border-r border-[#E6E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E2342] text-white flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display text-xl font-semibold tracking-tight text-[#171A2E] block leading-none">
              MEMORIA
            </span>
            <span className="text-xs text-[#646B84]">My Life Journey</span>
          </div>
        </div>

        <div className="max-w-lg my-12 lg:my-0">
          <p className="text-xs font-medium tracking-wide text-[#4F5BD5] mb-3">
            Jurnal Perjalanan Hidup · Penyimpanan Google Spreadsheet
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#171A2E] leading-[1.12] [text-wrap:balance]">
            Setiap Momen Punya Cerita, Setiap Cerita Menjadi Kenangan.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4E556F]">
            {needsTokenRefresh
              ? `Selamat datang kembali${userEmail ? ` (${userEmail})` : ''}. Hubungkan kembali izin Google Sheets untuk membaca serta menyimpan cerita dan foto ke spreadsheet pribadi Anda.`
              : 'Simpan foto terkompresi, tulis kisah di balik setiap peristiwa, dan kelola seluruh perjalanan hidup Anda secara gratis langsung di Google Spreadsheet pribadi.'}
          </p>

          <div className="mt-8 space-y-4">
            {/* Official Sign in with Google button style */}
            <button
              type="button"
              onClick={onSignIn}
              disabled={loading}
              className="inline-flex items-center gap-3 h-11 px-4 rounded-md bg-white border border-[#747775] hover:bg-[#F8FAFD] hover:shadow-xs text-[#1F1F1F] text-sm font-medium transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              style={{ fontFamily: 'Roboto, var(--font-sans)' }}
            >
              <svg
                className="w-[18px] h-[18px] shrink-0 block"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>
                {loading
                  ? 'Menghubungkan ke Google Sheets...'
                  : needsTokenRefresh
                  ? 'Hubungkan Google Sheets'
                  : 'Sign in with Google'}
              </span>
            </button>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs leading-relaxed"
              >
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[#646B84]">
              <FileSpreadsheet className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                Semua catatan dan foto terkompresi disimpan langsung di Google Spreadsheet Anda.
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#E6E8F0]">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#171A2E]">
              <CalendarClock className="w-4 h-4 text-[#4F5BD5]" />
              <span>Lini Masa Hidup</span>
            </div>
            <p className="mt-1 text-xs text-[#646B84] leading-relaxed">
              Urutkan tonggak penting hidup dari tahun ke tahun secara kronologis.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#171A2E]">
              <BookOpen className="w-4 h-4 text-[#4F5BD5]" />
              <span>Cerita &amp; Foto Hemat</span>
            </div>
            <p className="mt-1 text-xs text-[#646B84] leading-relaxed">
              Foto otomatis dikompresi ringan dan disimpan aman di tab spreadsheet.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#171A2E]">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>Kilas Balik</span>
            </div>
            <p className="mt-1 text-xs text-[#646B84] leading-relaxed">
              Pengingat berkala agar kenangan lama tak pernah terlupakan.
            </p>
          </div>
        </div>
      </div>

      {/* Right Visual Column */}
      <div className="lg:w-[46%] relative min-h-[320px] lg:min-h-screen overflow-hidden bg-[#1E2342]">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Pemandangan matahari terbit di puncak gunung"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12162C]/90 via-[#12162C]/35 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-8 sm:p-12 text-white">
          <p className="text-xs font-mono tracking-wider text-amber-200/90 mb-2">
            ALBUM DIGITAL PRIBADI
          </p>
          <blockquote className="font-display text-2xl sm:text-3xl font-medium leading-snug max-w-md [text-wrap:balance]">
            “Simpan cerita, abadikan momen, kenang sepanjang waktu.”
          </blockquote>
          <p className="mt-3 text-xs text-white/75">
            Dieng · Bandung · Yogyakarta · Jakarta
          </p>
        </div>
      </div>
    </div>
  );
}
