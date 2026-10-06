"use client";
import React from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    ScreenShare,
    MonitorOff,
    Users,
    MessageSquare,
    Hand,
    LayoutGrid,
    MonitorPlay,
    PhoneOff,
    Maximize,
    Minimize,
    Circle,
} from "lucide-react";

import {
    studioDockBtn,
    studioDockLabelAlways,
    studioDockLabelDesktopOnly,
} from "./studio-control-bar-classes";

interface StudioControlBarProps {
    isMicEnabled: boolean;
    onToggleMic: () => void;
    isCamEnabled: boolean;
    onToggleCam: () => void;
    isScreenShareEnabled: boolean;
    onToggleScreenShare: () => void;
    viewMode: "presentation" | "gallery";
    onToggleViewMode: () => void;
    isParticipantsOpen: boolean;
    onToggleParticipants: () => void;
    participantCount: number;
    isChatOpen: boolean;
    onToggleChat: () => void;
    unreadCount: number;
    isHandRaised: boolean;
    onToggleHand: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onEndOrLeave: () => void;
    isHost?: boolean;
    canPublish?: boolean;
    isRecording?: boolean;
    onToggleRecording?: () => void;
}

export const StudioControlBar: React.FC<StudioControlBarProps> = ({
    isMicEnabled,
    onToggleMic,
    isCamEnabled,
    onToggleCam,
    isScreenShareEnabled,
    onToggleScreenShare,
    viewMode,
    onToggleViewMode,
    isParticipantsOpen,
    onToggleParticipants,
    participantCount,
    isChatOpen,
    onToggleChat,
    unreadCount,
    isHandRaised,
    onToggleHand,
    isFullscreen,
    onToggleFullscreen,
    onEndOrLeave,
    isHost = false,
    canPublish = true,
    isRecording = false,
    onToggleRecording,
}) => {
    return (
        <nav
            className="shrink-0 z-40 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-lg pb-[max(0.35rem,env(safe-area-inset-bottom))] select-none"
            aria-label="Meeting Controls"
        >
            <div className="flex h-[4.75rem] min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain px-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:px-6 [&::-webkit-scrollbar]:hidden lg:overflow-visible lg:justify-between">
            {/* Left Controls: Audio & Video */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Audio (Mic) Toggle */}
                <button
                    type="button"
                    onClick={onToggleMic}
                    disabled={!canPublish}
                    className={`${studioDockBtn} ${
                        isMicEnabled
                            ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
                    } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                    <div className="relative p-1">
                        {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </div>
                    <span className={studioDockLabelAlways}>
                        {isMicEnabled ? "Mute" : "Unmute"}
                    </span>
                </button>

                {/* Video (Cam) Toggle */}
                <button
                    type="button"
                    onClick={onToggleCam}
                    disabled={!canPublish}
                    className={`${studioDockBtn} ${
                        isCamEnabled
                            ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
                    } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isCamEnabled ? "Stop Video" : "Start Video"}
                >
                    <div className="relative p-1">
                        {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </div>
                    <span className={studioDockLabelAlways}>
                        {isCamEnabled ? "Stop Video" : "Start Video"}
                    </span>
                </button>
            </div>

            {/* Center Controls: Screen Share, Layout View, Hand, Chat, Participants */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Screen Share (Presentation Mode) */}
                <button
                    type="button"
                    onClick={onToggleScreenShare}
                    className={`${studioDockBtn} sm:min-w-[4.25rem] ${
                        isScreenShareEnabled
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300"
                    }`}
                    title={isScreenShareEnabled ? "Stop Sharing Screen" : "Share Screen"}
                >
                    <div className="relative p-1">
                        {isScreenShareEnabled ? <MonitorOff size={20} /> : <ScreenShare size={20} />}
                    </div>
                    <span className={studioDockLabelDesktopOnly}>
                        {isScreenShareEnabled ? "Stop Share" : "Share"}
                    </span>
                </button>

                {/* View Mode Toggle (Mobile / Tablet quick switcher) */}
                <button
                    type="button"
                    onClick={onToggleViewMode}
                    className={`${studioDockBtn} lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800`}
                    title={viewMode === "presentation" ? "Switch to Gallery Grid" : "Switch to Presentation"}
                >
                    <div className="relative p-1">
                        {viewMode === "presentation" ? <LayoutGrid size={20} /> : <MonitorPlay size={20} />}
                    </div>
                    <span className={studioDockLabelDesktopOnly}>
                        {viewMode === "presentation" ? "Gallery" : "Present"}
                    </span>
                </button>

                {/* Participants Panel Toggle */}
                <button
                    type="button"
                    onClick={onToggleParticipants}
                    className={`${studioDockBtn} sm:min-w-[4.25rem] relative ${
                        isParticipantsOpen
                            ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Participants"
                >
                    <div className="relative p-1">
                        <Users size={20} />
                        {participantCount > 0 && (
                            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-zinc-700 text-white text-[9px] font-bold border border-zinc-900">
                                {participantCount}
                            </span>
                        )}
                    </div>
                    <span className={studioDockLabelDesktopOnly}>Attendees</span>
                </button>

                {/* Chat (Message Channel) Toggle */}
                <button
                    type="button"
                    onClick={onToggleChat}
                    className={`${studioDockBtn} sm:min-w-[4.25rem] relative ${
                        isChatOpen
                            ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Chat / Messages"
                >
                    <div className="relative p-1">
                        <MessageSquare size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[9px] font-bold animate-pulse shadow-md shadow-blue-500/50">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <span className={studioDockLabelDesktopOnly}>Chat</span>
                </button>

                {/* Raise Hand Toggle */}
                <button
                    type="button"
                    onClick={onToggleHand}
                    className={`${studioDockBtn} ${
                        isHandRaised
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title={isHandRaised ? "Lower Hand" : "Raise Hand"}
                >
                    <div className="relative p-1">
                        <Hand size={20} className={isHandRaised ? "animate-bounce" : ""} />
                    </div>
                    <span className={studioDockLabelDesktopOnly}>
                        {isHandRaised ? "Hand Up" : "Hand"}
                    </span>
                </button>
            </div>

            {/* Right Controls: Fullscreen & End/Leave */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className={`${studioDockBtn} hidden sm:flex text-zinc-400 hover:text-white hover:bg-zinc-800`}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
                >
                    <div className="relative p-1">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </div>
                    <span className={studioDockLabelDesktopOnly}>
                        {isFullscreen ? "Exit" : "Full"}
                    </span>
                </button>

                {/* Record Toggle */}
                {onToggleRecording && (
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        className={`${studioDockBtn} ${
                            isRecording
                                ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                        title={isRecording ? "Stop Recording" : "Record Session"}
                    >
                        <div className="relative p-1">
                            <Circle size={20} className={isRecording ? "fill-rose-500 text-rose-500 animate-pulse" : ""} />
                        </div>
                        <span className={studioDockLabelDesktopOnly}>
                            {isRecording ? "Stop Rec" : "Record"}
                        </span>
                    </button>
                )}

                {/* End / Leave Button */}
                <button
                    type="button"
                    onClick={onEndOrLeave}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold shadow-lg transition-all active:scale-95 sm:px-5 sm:text-sm ${
                        isHost
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                            : "bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 border border-zinc-700/50"
                    }`}
                >
                    <PhoneOff size={16} />
                    <span className="font-semibold">{isHost ? "End" : "Leave"}</span>
                </button>
            </div>
            </div>
        </nav>
    );
};
