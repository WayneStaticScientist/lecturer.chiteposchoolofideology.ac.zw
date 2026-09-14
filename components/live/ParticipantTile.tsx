"use client";
import React from "react";
import { TrackReferenceOrPlaceholder, VideoTrack } from "@livekit/components-react";
import { Mic, MicOff, Pin, UserX, Shield, Crown } from "lucide-react";

interface ParticipantTileProps {
    trackRef: TrackReferenceOrPlaceholder;
    isPinned?: boolean;
    onPinToggle?: () => void;
    onRemove?: (identity: string, name: string) => void;
    isHost?: boolean;
    isPresentationStage?: boolean;
    fitMode?: "cover" | "contain";
    className?: string;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
    trackRef,
    isPinned = false,
    onPinToggle,
    onRemove,
    isHost = false,
    isPresentationStage = false,
    fitMode = "cover",
    className = "",
}) => {
    const participant = trackRef.participant;
    const isVideoEnabled = trackRef.publication && !trackRef.publication.isMuted && trackRef.publication.track;
    const isSpeaking = participant?.isSpeaking;
    const isLocal = participant?.isLocal;

    // Parse metadata if available
    let role: string | null = null;
    try {
        if (participant?.metadata) {
            const meta = JSON.parse(participant.metadata);
            role = meta.role;
        }
    } catch {
        role = null;
    }

    const isLecturer = role === "lecturer" || participant?.name?.toLowerCase().includes("lecturer");
    const displayName = participant?.name || (isLocal ? "You" : "Participant");

    // Initials for avatar fallback
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 transition-all duration-300 flex items-center justify-center select-none ${
                isSpeaking
                    ? "ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] border-emerald-500/50"
                    : "hover:border-zinc-700"
            } ${className}`}
        >
            {/* Video or Fallback Avatar */}
            {isVideoEnabled ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <VideoTrack
                        trackRef={trackRef}
                        className={`w-full h-full ${
                            fitMode === "contain" ? "object-contain" : "object-cover"
                        }`}
                    />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 p-4">
                    <div className="relative">
                        <div className={`rounded-full flex items-center justify-center font-bold text-white shadow-xl transition-transform group-hover:scale-105 ${
                            isPresentationStage ? "w-28 h-28 text-3xl" : "w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl"
                        } ${
                            isLecturer
                                ? "bg-gradient-to-tr from-amber-600 via-rose-600 to-red-600 shadow-rose-600/20"
                                : "bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 shadow-teal-600/20"
                        }`}>
                            {initials}
                        </div>
                        {isSpeaking && (
                            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
                        )}
                    </div>
                    {isPresentationStage && (
                        <p className="mt-4 text-base font-semibold text-zinc-300">{displayName}</p>
                    )}
                </div>
            )}

            {/* Top Right Actions (Pin & Remove) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 sm:opacity-0 focus-within:opacity-100 transition-opacity z-20">
                {onPinToggle && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPinToggle();
                        }}
                        title={isPinned ? "Unpin participant" : "Pin to stage"}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                            isPinned
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : "bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white"
                        }`}
                    >
                        <Pin size={14} className={isPinned ? "rotate-45" : ""} />
                    </button>
                )}

                {isHost && !isLocal && onRemove && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(participant?.identity || "", displayName);
                        }}
                        title="Remove participant"
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-zinc-300 hover:text-white backdrop-blur-md transition-colors"
                    >
                        <UserX size={14} />
                    </button>
                )}
            </div>

            {/* Speaking Audio Wave Pulse (Top Left when speaking) */}
            {isSpeaking && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-300 tracking-wide uppercase">Speaking</span>
                </div>
            )}

            {/* Bottom Info Bar: Name & Mic Status */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 max-w-[85%]">
                    {/* Role Icon / Badge */}
                    {isLecturer ? (
                        <Crown size={13} className="text-amber-400 shrink-0" />
                    ) : (
                        isLocal && <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-blue-500/30 text-blue-300">YOU</span>
                    )}

                    <span className="text-xs font-medium text-white truncate">
                        {displayName}
                    </span>

                    {/* Mic status icon */}
                    <div className="shrink-0 ml-0.5">
                        {participant?.isMicrophoneEnabled ? (
                            <Mic size={12} className={isSpeaking ? "text-emerald-400 animate-pulse" : "text-zinc-400"} />
                        ) : (
                            <MicOff size={12} className="text-rose-400" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
