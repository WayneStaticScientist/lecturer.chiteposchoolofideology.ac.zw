"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@livekit/components-react";
import { MessageSquare, Send, Maximize2, Minimize2, X, Sparkles, Smile } from "lucide-react";

interface ChatChannelProps {
    isOpen: boolean;
    onClose: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    currentUserName?: string;
}

const QUICK_REACTIONS = ["👍", "👏", "💡", "🙋‍♂️", "❤️", "🔥"];

export const ChatChannel: React.FC<ChatChannelProps> = ({
    isOpen,
    onClose,
    isFullscreen,
    onToggleFullscreen,
    currentUserName = "You",
}) => {
    const { chatMessages, send, isSending } = useChat();
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, isOpen]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || isSending) return;

        try {
            await send(trimmed);
            setInputText("");
            inputRef.current?.focus();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleSendQuickReaction = async (emoji: string) => {
        if (isSending) return;
        try {
            await send(emoji);
        } catch (err) {
            console.error("Failed to send emoji:", err);
        }
    };

    if (!isOpen) return null;

    // Fullscreen vs Docked Panel container styling
    const containerClasses = isFullscreen
        ? "fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200"
        : "fixed md:relative inset-y-0 right-0 z-40 w-full sm:w-96 md:w-84 lg:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl shrink-0";

    return (
        <aside className={containerClasses} aria-label="Meeting Chat">
            <div className={`flex flex-col h-full ${isFullscreen ? "max-w-4xl w-full mx-auto" : "w-full"}`}>
                {/* Header */}
                <div className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/60 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                In-Call Messages
                                {isFullscreen && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Fullscreen View
                                    </span>
                                )}
                            </h2>
                            <p className="text-[11px] text-zinc-400">Messages sent to everyone</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Fullscreen Mode Toggle */}
                        <button
                            type="button"
                            onClick={onToggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chat"}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                        </button>

                        {/* Close Panel */}
                        <button
                            type="button"
                            onClick={onClose}
                            title="Close Chat"
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-700/40">
                                <Sparkles size={24} />
                            </div>
                            <p className="text-sm font-semibold text-zinc-300 mb-1">No messages yet</p>
                            <p className="text-xs text-zinc-500 max-w-xs">
                                Say hello or ask a question during the lecture!
                            </p>
                        </div>
                    ) : (
                        chatMessages.map((msg, idx) => {
                            const senderName = msg.from?.name || "Participant";
                            const isLocal = msg.from?.isLocal;
                            const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            // Parse role
                            let role = "student";
                            try {
                                if (msg.from?.metadata) {
                                    const meta = JSON.parse(msg.from.metadata);
                                    if (meta.role) role = meta.role;
                                }
                            } catch {
                                if (senderName.toLowerCase().includes("lecturer")) role = "lecturer";
                            }

                            const isLecturer = role === "lecturer";

                            return (
                                <div
                                    key={msg.id || idx}
                                    className={`flex flex-col ${isLocal ? "items-end" : "items-start"}`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1 px-1">
                                        <span className={`text-xs font-semibold ${isLocal ? "text-blue-400" : "text-zinc-300"}`}>
                                            {isLocal ? "You" : senderName}
                                        </span>
                                        {isLecturer && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                HOST
                                            </span>
                                        )}
                                        <span className="text-[10px] text-zinc-500">{timeString}</span>
                                    </div>

                                    <div
                                        className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-sm break-words shadow-md leading-relaxed ${
                                            isLocal
                                                ? "bg-blue-600 text-white rounded-tr-xs"
                                                : isLecturer
                                                ? "bg-zinc-800 text-amber-100 border border-amber-500/20 rounded-tl-xs"
                                                : "bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-tl-xs"
                                        } ${isFullscreen ? "text-base px-4 py-3" : ""}`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Reactions Bar */}
                <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between shrink-0">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Smile size={12} /> React:
                    </span>
                    <div className="flex items-center gap-1">
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => handleSendQuickReaction(emoji)}
                                disabled={isSending}
                                className="text-sm p-1 rounded-lg hover:bg-zinc-800 hover:scale-125 transition-transform"
                                title={`Send ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Input Bar */}
                <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-t border-zinc-800 bg-zinc-900 shrink-0"
                >
                    <div className="relative flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Send a message to everyone..."
                            disabled={isSending}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isSending}
                            aria-label="Send message"
                            className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-md active:scale-95"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 px-1">
                        <span className="text-[10px] text-zinc-500">Press Enter to send</span>
                    </div>
                </form>
            </div>
        </aside>
    );
};
