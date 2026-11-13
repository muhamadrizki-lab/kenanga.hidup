import { Camera, BookOpen, CalendarClock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../lib/sampleAssets';

interface AuthScreenProps {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
}

export function AuthScreen({ onSignIn, loading, error }: AuthScreenProps) {
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
            Jurnal Perjalanan Hidup &amp; Album Digital Pribadi
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#171A2E] leading-[1.12] [text-wrap:balance]">
            Setiap Momen Punya Cerita, Setiap Cerita Menjadi Kenangan.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4E556F]">
            Simpan foto berharga, tulis kisah di balik setiap peristiwa, susun berdasarkan
            lini masa hidup, dan biarkan MEMORIA mengingatkan kembali momen-momen hangat
            yang membentuk siapa Anda hari ini.
          </p>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={onSignIn}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#1E2342] text-white font-medium text-sm hover:bg-[#2A315A] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97 1 12 1 7.39 1 3.41 3.64 1.48 7.5l3.68 2.86C6.03 7.72 8.77 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.16 14.64A7.01 7.01 0 0 1 4.79 12c0-.91.16-1.79.37-2.64L1.48 6.5A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.48 5.5l3.68-2.86z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.23 0-5.97-2.72-6.84-6.36L1.48 14.88C3.41 19.36 7.39 23 12 23z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan Akun...' : 'Masuk dengan Google'}</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
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
              <ShieldCheck className="w-4 h-4 text-[#4F5BD5] shrink-0" />
              <span>Arsip kenangan Anda tersimpan aman dan bersifat pribadi per akun.</span>
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
              <span>Cerita &amp; Lokasi</span>
            </div>
            <p className="mt-1 text-xs text-[#646B84] leading-relaxed">
              Catat narasi, suasana hati, tanggal kejadian, dan tempat kenangan tercipta.
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
