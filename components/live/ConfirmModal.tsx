"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = true,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative text-left"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    {isDangerous && (
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
                            <AlertTriangle size={22} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-700/50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-lg transition-all ${
                            isDangerous
                                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 active:scale-95"
                                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 active:scale-95"
                        } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
