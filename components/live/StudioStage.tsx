"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Track } from "livekit-client";
import { useTracks, TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { ParticipantTile } from "./ParticipantTile";
import { Monitor, PinOff, Maximize, Minimize, Users } from "lucide-react";

interface StudioStageProps {
    viewMode: "presentation" | "gallery";
    onViewModeChange: (mode: "presentation" | "gallery") => void;
    pinnedTrackId: string | null;
    onPinTrack: (id: string | null) => void;
    onRemoveParticipant?: (identity: string, name: string) => void;
    isHost?: boolean;
}

export const StudioStage: React.FC<StudioStageProps> = ({
    viewMode,
    onViewModeChange,
    pinnedTrackId,
    onPinTrack,
    onRemoveParticipant,
    isHost = false,
}) => {
    const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");

    // Fetch camera and screen share tracks
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    // Check for active screen share
    const screenShareTrack = useMemo(() => {
        return tracks.find((t) => t.source === Track.Source.ScreenShare);
    }, [tracks]);

    // Auto-switch to presentation mode when someone shares screen
    useEffect(() => {
        if (screenShareTrack && viewMode !== "presentation") {
            onViewModeChange("presentation");
        }
    }, [screenShareTrack, viewMode, onViewModeChange]);

    // Camera tracks only
    const cameraTracks = useMemo(() => {
        return tracks.filter((t) => t.source === Track.Source.Camera);
    }, [tracks]);

    // Determine the focus track for presentation mode
    const focusTrack = useMemo(() => {
        if (screenShareTrack) return screenShareTrack;
        if (pinnedTrackId) {
            const found = tracks.find((t) => t.participant.identity === pinnedTrackId);
            if (found) return found;
        }
        // Active speaker track
        const speaker = cameraTracks.find((t) => t.participant.isSpeaking);
        if (speaker) return speaker;

        // Lecturer / Host track if available
        const lecturer = cameraTracks.find((t) => {
            try {
                const meta = JSON.parse(t.participant.metadata || "{}");
                return meta.role === "lecturer" || t.participant.name?.toLowerCase().includes("lecturer");
            } catch {
                return false;
            }
        });
        if (lecturer) return lecturer;

        return cameraTracks[0] || null;
    }, [screenShareTrack, pinnedTrackId, tracks, cameraTracks]);

    // Filmstrip tracks (everyone except the focused track)
    const filmstripTracks = useMemo(() => {
        if (!focusTrack) return cameraTracks;
        return tracks.filter((t) => {
            if (t.source === Track.Source.ScreenShare && focusTrack.source === Track.Source.ScreenShare) {
                return false;
            }
            return t.participant.identity !== focusTrack.participant.identity || t.source !== focusTrack.source;
        });
    }, [tracks, cameraTracks, focusTrack]);

    // Grid layout styling helper
    const getGridClass = (count: number) => {
        if (count <= 1) return "grid-cols-1 max-w-5xl";
        if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-6xl";
        if (count <= 4) return "grid-cols-1 sm:grid-cols-2 max-w-6xl";
        if (count <= 6) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-7xl";
        if (count <= 9) return "grid-cols-2 sm:grid-cols-3 max-w-7xl";
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-7xl";
    };

    if (tracks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 shadow-xl">
                    <Users size={36} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connecting to Studio...</h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                    Waiting for media streams to connect.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 p-2 sm:p-4 overflow-hidden relative">
            {viewMode === "presentation" && focusTrack ? (
                /* PRESENTATION MODE: Large Spotlight + Filmstrip */
                <div className="flex-1 flex flex-col min-h-0 gap-3">
                    {/* Primary Stage */}
                    <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center shadow-2xl">
                        <ParticipantTile
                            trackRef={focusTrack}
                            isPinned={pinnedTrackId === focusTrack.participant.identity}
                            onPinToggle={() => onPinTrack(pinnedTrackId === focusTrack.participant.identity ? null : focusTrack.participant.identity)}
                            onRemove={onRemoveParticipant}
                            isHost={isHost}
                            isPresentationStage={true}
                            fitMode={fitMode}
                            className="w-full h-full"
                        />

                        {/* Stage Controls Overlay (Top) */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
                            {/* Focus Indicator */}
                            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
                                {focusTrack.source === Track.Source.ScreenShare ? (
                                    <>
                                        <Monitor size={15} className="text-emerald-400" />
                                        <span className="text-xs font-semibold text-emerald-300">
                                            {focusTrack.participant.name}&apos;s Screen
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <span className="text-xs font-semibold text-white">
                                            Spotlight: {focusTrack.participant.name}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Fit/Fill and Unpin Buttons */}
                            <div className="pointer-events-auto flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
                                    className="px-2.5 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
                                    title={fitMode === "contain" ? "Fill Stage" : "Fit to Stage"}
                                >
                                    {fitMode === "contain" ? <Maximize size={13} /> : <Minimize size={13} />}
                                    <span className="hidden sm:inline">{fitMode === "contain" ? "Fill" : "Fit"}</span>
                                </button>

                                {pinnedTrackId && (
                                    <button
                                        type="button"
                                        onClick={() => onPinTrack(null)}
                                        className="px-2.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
                                        title="Unpin"
                                    >
                                        <PinOff size={13} />
                                        <span className="hidden sm:inline">Unpin</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participant Filmstrip (Horizontal Carousel) */}
                    {filmstripTracks.length > 0 && (
                        <div className="h-24 sm:h-32 shrink-0 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800 select-none">
                            {filmstripTracks.map((t) => {
                                const key = `${t.participant.identity}-${t.source}`;
                                const isSelected = focusTrack && focusTrack.participant.identity === t.participant.identity && focusTrack.source === t.source;

                                return (
                                    <div
                                        key={key}
                                        onClick={() => onPinTrack(t.participant.identity)}
                                        className={`h-full aspect-video shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-[1.03] ${
                                            isSelected
                                                ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20"
                                                : "opacity-80 hover:opacity-100"
                                        }`}
                                    >
                                        <ParticipantTile
                                            trackRef={t}
                                            isPinned={pinnedTrackId === t.participant.identity}
                                            onPinToggle={() => onPinTrack(pinnedTrackId === t.participant.identity ? null : t.participant.identity)}
                                            onRemove={onRemoveParticipant}
                                            isHost={isHost}
                                            className="w-full h-full"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* GALLERY GRID MODE: Zoom Equal-Tile Grid */
                <div className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    <div className={`grid w-full h-full max-h-full gap-2.5 sm:gap-3.5 mx-auto auto-rows-fr ${getGridClass(tracks.length)}`}>
                        {tracks.map((t) => {
                            const key = `${t.participant.identity}-${t.source}`;
                            return (
                                <ParticipantTile
                                    key={key}
                                    trackRef={t}
                                    isPinned={pinnedTrackId === t.participant.identity}
                                    onPinToggle={() => {
                                        onPinTrack(pinnedTrackId === t.participant.identity ? null : t.participant.identity);
                                        if (pinnedTrackId !== t.participant.identity) {
                                            onViewModeChange("presentation");
                                        }
                                    }}
                                    onRemove={onRemoveParticipant}
                                    isHost={isHost}
                                    className="w-full h-full min-h-[140px] sm:min-h-[180px]"
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
