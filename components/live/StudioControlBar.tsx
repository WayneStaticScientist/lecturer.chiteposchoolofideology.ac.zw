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
import { STUDIO_DOCK_FIXED_CLASS } from "./studio-dock-layout";

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

function MicVideoButtons({
  isMicEnabled,
  onToggleMic,
  isCamEnabled,
  onToggleCam,
  canPublish,
}: {
  isMicEnabled: boolean;
  onToggleMic: () => void;
  isCamEnabled: boolean;
  onToggleCam: () => void;
  canPublish: boolean;
}) {
  return (
    <>
      <button
        className={`${studioDockBtn} ${
          isMicEnabled
            ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
            : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
        } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!canPublish}
        title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
        type="button"
        onClick={onToggleMic}
      >
        <div className="relative p-1">
          {isMicEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </div>
        <span className={studioDockLabelAlways}>
          {isMicEnabled ? "Mute" : "Unmute"}
        </span>
      </button>
      <button
        className={`${studioDockBtn} ${
          isCamEnabled
            ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
            : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-500"
        } ${!canPublish ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!canPublish}
        title={isCamEnabled ? "Stop Video" : "Start Video"}
        type="button"
        onClick={onToggleCam}
      >
        <div className="relative p-1">
          {isCamEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </div>
        <span className={studioDockLabelAlways}>
          {isCamEnabled ? "Stop Video" : "Start Video"}
        </span>
      </button>
    </>
  );
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
  const leaveBtn = (
    <button
      className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-100 shadow-lg transition-all hover:bg-rose-600 hover:text-white active:scale-95 sm:text-sm"
      type="button"
      onClick={onEndOrLeave}
    >
      <PhoneOff size={16} />
      <span className="font-semibold">{isHost ? "End" : "Leave"}</span>
    </button>
  );

  const secondaryButtons = (
    <>
      <button
        className={`${studioDockBtn} sm:min-w-[4.25rem] ${
          isScreenShareEnabled
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
            : "hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300"
        }`}
        title={isScreenShareEnabled ? "Stop Sharing Screen" : "Share Screen"}
        type="button"
        onClick={onToggleScreenShare}
      >
        <div className="relative p-1">
          {isScreenShareEnabled ? (
            <MonitorOff size={20} />
          ) : (
            <ScreenShare size={20} />
          )}
        </div>
        <span className={studioDockLabelDesktopOnly}>
          {isScreenShareEnabled ? "Stop Share" : "Share"}
        </span>
      </button>
      <button
        className={`${studioDockBtn} lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800`}
        title={
          viewMode === "presentation"
            ? "Switch to Gallery Grid"
            : "Switch to Presentation"
        }
        type="button"
        onClick={onToggleViewMode}
      >
        <div className="relative p-1">
          {viewMode === "presentation" ? (
            <LayoutGrid size={20} />
          ) : (
            <MonitorPlay size={20} />
          )}
        </div>
        <span className={studioDockLabelDesktopOnly}>
          {viewMode === "presentation" ? "Gallery" : "Present"}
        </span>
      </button>
      <button
        className={`${studioDockBtn} sm:min-w-[4.25rem] relative ${
          isParticipantsOpen
            ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        }`}
        title="Participants"
        type="button"
        onClick={onToggleParticipants}
      >
        <div className="relative p-1">
          <Users size={20} />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-2 rounded-full border border-zinc-900 bg-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {participantCount}
            </span>
          )}
        </div>
        <span className={studioDockLabelDesktopOnly}>Attendees</span>
      </button>
      <button
        className={`${studioDockBtn} sm:min-w-[4.25rem] relative ${
          isChatOpen
            ? "bg-zinc-800 text-white border border-zinc-700/60 shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        }`}
        title="Chat / Messages"
        type="button"
        onClick={onToggleChat}
      >
        <div className="relative p-1">
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 animate-pulse rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md shadow-blue-500/50">
              {unreadCount}
            </span>
          )}
        </div>
        <span className={studioDockLabelDesktopOnly}>Chat</span>
      </button>
      <button
        className={`${studioDockBtn} ${
          isHandRaised
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        }`}
        title={isHandRaised ? "Lower Hand" : "Raise Hand"}
        type="button"
        onClick={onToggleHand}
      >
        <div className="relative p-1">
          <Hand className={isHandRaised ? "animate-bounce" : ""} size={20} />
        </div>
        <span className={studioDockLabelDesktopOnly}>
          {isHandRaised ? "Hand Up" : "Hand"}
        </span>
      </button>
      {onToggleRecording && (
        <button
          className={`${studioDockBtn} ${
            isRecording
              ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/10"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          title={isRecording ? "Stop Recording" : "Record Session"}
          type="button"
          onClick={onToggleRecording}
        >
          <div className="relative p-1">
            <Circle
              className={
                isRecording ? "fill-rose-500 text-rose-500 animate-pulse" : ""
              }
              size={20}
            />
          </div>
          <span className={studioDockLabelDesktopOnly}>
            {isRecording ? "Stop Rec" : "Record"}
          </span>
        </button>
      )}
    </>
  );

  return (
    <nav
      aria-label="Meeting Controls"
      className={`${STUDIO_DOCK_FIXED_CLASS} select-none backdrop-blur-lg`}
    >
      {/* Mobile: mic/video/leave always on top row */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-2 py-2 md:hidden">
        <div className="flex items-center gap-1">
          <MicVideoButtons
            canPublish={canPublish}
            isCamEnabled={isCamEnabled}
            isMicEnabled={isMicEnabled}
            onToggleCam={onToggleCam}
            onToggleMic={onToggleMic}
          />
        </div>
        {leaveBtn}
      </div>
      <div className="flex h-14 min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain px-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {secondaryButtons}
      </div>

      {/* Desktop */}
      <div className="hidden h-[4.75rem] min-w-0 items-center gap-1 overflow-x-auto px-4 sm:gap-2 md:flex lg:justify-between lg:overflow-visible">
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <MicVideoButtons
            canPublish={canPublish}
            isCamEnabled={isCamEnabled}
            isMicEnabled={isMicEnabled}
            onToggleCam={onToggleCam}
            onToggleMic={onToggleMic}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {secondaryButtons}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            className={`${studioDockBtn} text-zinc-400 hover:text-white hover:bg-zinc-800`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
            type="button"
            onClick={onToggleFullscreen}
          >
            <div className="relative p-1">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </div>
            <span className={studioDockLabelDesktopOnly}>
              {isFullscreen ? "Exit" : "Full"}
            </span>
          </button>
          {leaveBtn}
        </div>
      </div>
    </nav>
  );
};
