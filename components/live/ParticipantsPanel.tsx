"use client";
import React, { useState, useMemo } from "react";
import { useParticipants } from "@livekit/components-react";
import { Users, Search, Mic, MicOff, Video, VideoOff, UserX, Crown, X, Hand } from "lucide-react";

interface ParticipantsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onRemoveParticipant?: (identity: string, name: string) => void;
    isHost?: boolean;
    raisedHands?: Record<string, boolean>;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
    isOpen,
    onClose,
    onRemoveParticipant,
    isHost = false,
    raisedHands = {},
}) => {
    const participants = useParticipants();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter participants based on search
    const filteredParticipants = useMemo(() => {
        if (!searchQuery.trim()) return participants;
        const q = searchQuery.toLowerCase();
        return participants.filter((p) => (p.name || p.identity).toLowerCase().includes(q));
    }, [participants, searchQuery]);

    // Separate host and attendees
    const { hosts, attendees } = useMemo(() => {
        const h: typeof participants = [];
        const a: typeof participants = [];

        filteredParticipants.forEach((p) => {
            let isLecturer = false;
            try {
                if (p.metadata) {
                    const meta = JSON.parse(p.metadata);
                    if (meta.role === "lecturer") isLecturer = true;
                }
            } catch {
                if (p.name?.toLowerCase().includes("lecturer")) isLecturer = true;
            }

            if (isLecturer) {
                h.push(p);
            } else {
                a.push(p);
            }
        });

        return { hosts: h, attendees: a };
    }, [filteredParticipants]);

    if (!isOpen) return null;

    return (
        <aside 
            className="fixed md:relative inset-y-0 right-0 z-40 w-full sm:w-88 md:w-80 lg:w-88 bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl shrink-0"
            aria-label="Participants List"
        >
            {/* Header */}
            <div className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/60 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Users size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                            Participants
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                                {participants.length}
                            </span>
                        </h2>
                        <p className="text-[11px] text-zinc-400">Manage attendees & audio</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    title="Close Participants"
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-zinc-800/80 shrink-0">
                <div className="relative flex items-center">
                    <Search size={15} className="absolute left-3 text-zinc-500 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search participants..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
                {/* Host Section */}
                {hosts.length > 0 && (
                    <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 block mb-2">
                            Host ({hosts.length})
                        </span>
                        <div className="space-y-1">
                            {hosts.map((p) => (
                                <ParticipantRow
                                    key={p.identity}
                                    participant={p}
                                    isHostRole={true}
                                    canRemove={false}
                                    isHandRaised={!!raisedHands[p.identity]}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendees Section */}
                <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 block mb-2">
                        In Call ({attendees.length})
                    </span>
                    {attendees.length === 0 ? (
                        <p className="text-xs text-zinc-500 px-2 italic">No other attendees yet</p>
                    ) : (
                        <div className="space-y-1">
                            {attendees.map((p) => (
                                <ParticipantRow
                                    key={p.identity}
                                    participant={p}
                                    isHostRole={false}
                                    canRemove={isHost && !p.isLocal}
                                    onRemove={() => onRemoveParticipant?.(p.identity, p.name || p.identity)}
                                    isHandRaised={!!raisedHands[p.identity]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

interface ParticipantRowProps {
    participant: any;
    isHostRole?: boolean;
    canRemove?: boolean;
    onRemove?: () => void;
    isHandRaised?: boolean;
}

const ParticipantRow: React.FC<ParticipantRowProps> = ({
    participant,
    isHostRole,
    canRemove,
    onRemove,
    isHandRaised,
}) => {
    const displayName = participant.name || (participant.isLocal ? "You" : "Participant");
    const isSpeaking = participant.isSpeaking;
    const isMicEnabled = participant.isMicrophoneEnabled;
    const isCamEnabled = participant.isCameraEnabled;

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/60 transition-colors group">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 relative ${
                    isHostRole
                        ? "bg-gradient-to-tr from-amber-600 to-rose-600 text-white"
                        : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                }`}>
                    {initials}
                    {isSpeaking && (
                        <span className="absolute -inset-0.5 rounded-full border-2 border-emerald-400 animate-pulse pointer-events-none" />
                    )}
                </div>

                {/* Name & Badges */}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-[150px]">
                            {displayName}
                        </span>
                        {participant.isLocal && (
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">
                                YOU
                            </span>
                        )}
                        {isHostRole && (
                            <span title="Host">
                                <Crown size={12} className="text-amber-400 shrink-0" />
                            </span>
                        )}
                        {isHandRaised && (
                            <span className="text-xs shrink-0 animate-bounce" title="Hand Raised">
                                ✋
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Icons & Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Audio Status */}
                <div className={`p-1.5 rounded-lg ${
                    isMicEnabled
                        ? isSpeaking ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400"
                        : "bg-rose-500/15 text-rose-400"
                }`}>
                    {isMicEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                </div>

                {/* Video Status */}
                <div className={`p-1.5 rounded-lg ${
                    isCamEnabled ? "text-zinc-400" : "text-zinc-600"
                }`}>
                    {isCamEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                </div>

                {/* Kick / Remove Participant Button (Host only) */}
                {canRemove && onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Remove participant from call"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-rose-600 transition-colors ml-0.5"
                    >
                        <UserX size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
