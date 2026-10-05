"use client";

import { Loader2, X } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

export function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({
  onCancel,
  submitLabel,
  loading,
  disabled,
}: {
  onCancel: () => void;
  submitLabel: string;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 rounded-xl px-4 py-3 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : submitLabel}
      </button>
    </div>
  );
}
