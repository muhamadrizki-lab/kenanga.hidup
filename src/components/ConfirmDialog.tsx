import { AlertTriangle, FileSpreadsheet, X } from 'lucide-react';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
}

interface ConfirmDialogProps {
  state: ConfirmDialogState | null;
  busy: boolean;
  onCancel: () => void;
  onProceed: () => void;
}

export function ConfirmDialog({
  state,
  busy,
  onCancel,
  onProceed,
}: ConfirmDialogProps) {
  if (!state || !state.open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#101325]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white rounded-2xl border border-[#E6E8F0] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E6E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                state.destructive
                  ? 'bg-red-50 text-red-600'
                  : 'bg-indigo-50 text-[#4F5BD5]'
              }`}
            >
              {state.destructive ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
            </div>
            <h2
              id="confirm-dialog-title"
              className="font-display text-base font-semibold text-[#171A2E]"
            >
              {state.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Tutup konfirmasi"
            className="p-1.5 rounded-lg text-[#646B84] hover:text-[#171A2E] cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[#4E556F] leading-relaxed">{state.description}</p>
        </div>

        <div className="px-6 py-4 border-t border-[#E6E8F0] bg-[#F9FAFD] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-[#E6E8F0] bg-white hover:bg-[#F6F7FB] text-xs font-semibold text-[#171A2E] cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={busy}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer disabled:opacity-60 ${
              state.destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1E2342] hover:bg-[#2A315A]'
            }`}
          >
            {busy ? 'Memproses...' : state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
