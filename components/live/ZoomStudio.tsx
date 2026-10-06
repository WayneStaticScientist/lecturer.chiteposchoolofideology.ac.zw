"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    useLocalParticipant,
    useParticipants,
    useRoomContext,
    useChat,
} from "@livekit/components-react";
import { RoomEvent, DataPacket_Kind } from "livekit-client";
import { toast } from "react-hot-toast";

import { StudioHeader } from "./StudioHeader";
import { StudioStage } from "./StudioStage";
import { StudioControlBar } from "./StudioControlBar";
import { STUDIO_DOCK_SPACER_CLASS } from "./studio-dock-layout";
import { ChatChannel } from "./ChatChannel";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { ConfirmModal } from "./ConfirmModal";

import { removeLiveParticipant, endLiveSchedule } from "@/services/api";

interface ZoomStudioProps {
    courseId: string;
    scheduleId: string;
    scheduleTitle?: string;
    isHost?: boolean;
}

export const ZoomStudio: React.FC<ZoomStudioProps> = ({
    courseId,
    scheduleId,
    scheduleTitle = "Live Studio",
    isHost = true,
}) => {
    const router = useRouter();
    const room = useRoomContext();
    const {
        isMicrophoneEnabled,
        isCameraEnabled,
        isScreenShareEnabled,
        localParticipant,
    } = useLocalParticipant();

    const participants = useParticipants();
    const { chatMessages } = useChat();

    // Studio UI state
    const [viewMode, setViewMode] = useState<"presentation" | "gallery">("presentation");
    const [pinnedTrackId, setPinnedTrackId] = useState<string | null>(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatFullscreen, setIsChatFullscreen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);
    const prevMessagesLength = useRef(chatMessages.length);

    const [isHandRaised, setIsHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({});

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        isDangerous: boolean;
        isLoading?: boolean;
        action: () => Promise<void> | void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        isDangerous: true,
        action: () => {},
    });

    // Handle Unread Chat Messages
    useEffect(() => {
        if (chatMessages.length > prevMessagesLength.current) {
            const newMessages = chatMessages.slice(prevMessagesLength.current);
            
            if (!isChatOpen) {
                setUnreadCount((prev) => prev + newMessages.length);
                
                // Show a pop-out notification for new messages
                newMessages.forEach((msg) => {
                    if (msg.from?.identity !== localParticipant.identity) {
                        toast(`💬 ${msg.from?.name || "Participant"}: ${msg.message}`, {
                            position: "bottom-right",
                            duration: 4000,
                            style: {
                                background: "#18181b",
                                color: "#fff",
                                border: "1px solid #27272a",
                                borderRadius: "12px",
                                fontSize: "13px",
                                maxWidth: "300px"
                            }
                        });
                    }
                });
            }
        }
        prevMessagesLength.current = chatMessages.length;
    }, [chatMessages, isChatOpen, localParticipant.identity]);

    const handleToggleChat = useCallback(() => {
        setIsChatOpen((prev) => {
            if (!prev) setUnreadCount(0);
            return !prev;
        });
        // On mobile, close participants if chat opens
        if (window.innerWidth < 768) {
            setIsParticipantsOpen(false);
        }
    }, []);

    const handleToggleParticipants = useCallback(() => {
        setIsParticipantsOpen((prev) => !prev);
        // On mobile, close chat if participants opens
        if (window.innerWidth < 768) {
            setIsChatOpen(false);
        }
    }, []);

    // Fullscreen handler
    const handleToggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error("Failed to enter fullscreen:", err);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.error("Failed to exit fullscreen:", err);
            });
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    // Recording Logic
    const handleToggleRecording = useCallback(async () => {
        if (isRecording) {
            // Stop Recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
                toast.success("Recording stopped and downloading...");
            }
            return;
        }

        // Start Recording
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            recordedChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `recording-${scheduleId}.webm`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setIsRecording(false);
            };

            // Listen for when the user clicks "Stop Sharing" on the browser's native control
            stream.getVideoTracks()[0].onended = () => {
                if (mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // collect 1s chunks
            setIsRecording(true);
            toast.success("Recording started");
        } catch (err: any) {
            console.error("Recording error:", err);
            toast.error("Failed to start recording. Permission may have been denied.");
            setIsRecording(false);
        }
    }, [isRecording, scheduleId]);

    // Audio & Video Toggles
    const handleToggleMic = useCallback(async () => {
        try {
            await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        } catch (err: any) {
            toast.error(err?.message || "Could not toggle microphone");
        }
    }, [localParticipant, isMicrophoneEnabled]);

    const handleToggleCam = useCallback(async () => {
        try {
            await localParticipant.setCameraEnabled(!isCameraEnabled);
        } catch (err: any) {
            toast.error(err?.message || "Could not toggle camera");
        }
    }, [localParticipant, isCameraEnabled]);

    const handleToggleScreenShare = useCallback(async () => {
        try {
            await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
            if (!isScreenShareEnabled) {
                setViewMode("presentation");
            }
        } catch (err: any) {
            toast.error(err?.message || "Could not toggle screen share");
        }
    }, [localParticipant, isScreenShareEnabled]);

    // Data messaging for hand raises & kick notices
    const broadcastData = useCallback((payload: object) => {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(payload));
            room.localParticipant.publishData(data, { reliable: true });
        } catch (err) {
            console.error("Failed to broadcast data message:", err);
        }
    }, [room]);

    // Handle Hand Raise
    const handleToggleHand = useCallback(() => {
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);
        setRaisedHands((prev) => ({
            ...prev,
            [localParticipant.identity]: nextState,
        }));
        broadcastData({
            type: "HAND_RAISE",
            identity: localParticipant.identity,
            isRaised: nextState,
        });
        toast(nextState ? "Hand raised ✋" : "Hand lowered", { icon: nextState ? "✋" : "👌" });
    }, [isHandRaised, localParticipant.identity, broadcastData]);

    // Listen to Room Data Messages
    useEffect(() => {
        const handleDataReceived = (payload: Uint8Array, participant?: any) => {
            try {
                const decoder = new TextDecoder();
                const str = decoder.decode(payload);
                const data = JSON.parse(str);

                if (data.type === "HAND_RAISE") {
                    setRaisedHands((prev) => ({
                        ...prev,
                        [data.identity]: data.isRaised,
                    }));
                } else if (data.type === "KICK_NOTICE") {
                    if (data.identity === localParticipant.identity) {
                        toast.error("You have been removed from this live lecture by the host.", {
                            duration: 6000,
                        });
                        room.disconnect();
                        router.push(`/courses/${courseId}`);
                    }
                }
            } catch (e) {
                // Ignore non-json data
            }
        };

        room.on(RoomEvent.DataReceived, handleDataReceived);
        return () => {
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room, localParticipant.identity, router, courseId]);

    // Remove Participant (Host Action)
    const handleRemoveParticipant = useCallback((identity: string, name: string) => {
        setModalConfig({
            isOpen: true,
            title: `Remove ${name}?`,
            description: `Are you sure you want to remove ${name} from this live lecture? They will be immediately disconnected from the room.`,
            confirmText: "Remove Participant",
            isDangerous: true,
            action: async () => {
                try {
                    setModalConfig((prev) => ({ ...prev, isLoading: true }));
                    await removeLiveParticipant(scheduleId, identity);
                    // Broadcast kick notice
                    broadcastData({ type: "KICK_NOTICE", identity });
                    toast.success(`${name} was removed from the lecture`);
                    setModalConfig((prev) => ({ ...prev, isOpen: false, isLoading: false }));
                } catch (err: any) {
                    toast.error(err?.response?.data?.error || "Failed to remove participant");
                    setModalConfig((prev) => ({ ...prev, isLoading: false }));
                }
            },
        });
    }, [scheduleId, broadcastData]);

    // End Broadcast (Host) or Leave Meeting (Student)
    const handleEndOrLeave = useCallback(() => {
        if (isHost) {
            setModalConfig({
                isOpen: true,
                title: "End Broadcast for Everyone?",
                description: "This will disconnect all attendees and mark this live lecture as completed.",
                confirmText: "End Broadcast",
                isDangerous: true,
                action: async () => {
                    try {
                        setModalConfig((prev) => ({ ...prev, isLoading: true }));
                        await endLiveSchedule(scheduleId);
                        toast.success("Broadcast ended successfully");
                        room.disconnect();
                        router.push(`/schedules`);
                    } catch (err: any) {
                        toast.error(err?.response?.data?.error || "Failed to end broadcast");
                        setModalConfig((prev) => ({ ...prev, isLoading: false }));
                    }
                },
            });
        } else {
            setModalConfig({
                isOpen: true,
                title: "Leave Live Session?",
                description: "Are you sure you want to leave this lecture? You can rejoin at any time while it is live.",
                confirmText: "Leave Lecture",
                isDangerous: false,
                action: () => {
                    room.disconnect();
                    router.push(`/courses/${courseId}`);
                },
            });
        }
    }, [isHost, scheduleId, room, router, courseId]);

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-zinc-950 text-white select-none">
            {/* Top Zoom Header */}
            <StudioHeader
                courseId={courseId}
                title={scheduleTitle}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                onEndOrLeave={handleEndOrLeave}
                isHost={isHost}
                isRecording={isRecording}
            />

            {/* Middle Main Content Area (Stage + Sidebars) */}
            <div className="flex-1 min-h-0 flex relative overflow-hidden">
                {/* Stage (Presentation or Gallery Grid) */}
                <StudioStage
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    pinnedTrackId={pinnedTrackId}
                    onPinTrack={setPinnedTrackId}
                    onRemoveParticipant={isHost ? handleRemoveParticipant : undefined}
                    isHost={isHost}
                />

                {/* Participants Sidebar */}
                <ParticipantsPanel
                    isOpen={isParticipantsOpen}
                    onClose={() => setIsParticipantsOpen(false)}
                    onRemoveParticipant={isHost ? handleRemoveParticipant : undefined}
                    isHost={isHost}
                    raisedHands={raisedHands}
                />

                {/* Message Channel (Chat) Sidebar / Fullscreen */}
                <ChatChannel
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    isFullscreen={isChatFullscreen}
                    onToggleFullscreen={() => setIsChatFullscreen((prev) => !prev)}
                    currentUserName={localParticipant.name}
                />
            </div>

            <div aria-hidden className={STUDIO_DOCK_SPACER_CLASS} />

            {/* Bottom Zoom Control Dock */}
            <StudioControlBar
                isMicEnabled={isMicrophoneEnabled}
                onToggleMic={handleToggleMic}
                isCamEnabled={isCameraEnabled}
                onToggleCam={handleToggleCam}
                isScreenShareEnabled={isScreenShareEnabled}
                onToggleScreenShare={handleToggleScreenShare}
                viewMode={viewMode}
                onToggleViewMode={() => setViewMode(viewMode === "presentation" ? "gallery" : "presentation")}
                isParticipantsOpen={isParticipantsOpen}
                onToggleParticipants={handleToggleParticipants}
                participantCount={participants.length}
                isChatOpen={isChatOpen}
                onToggleChat={handleToggleChat}
                unreadCount={unreadCount}
                isHandRaised={isHandRaised}
                onToggleHand={handleToggleHand}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                onEndOrLeave={handleEndOrLeave}
                isHost={isHost}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                description={modalConfig.description}
                confirmText={modalConfig.confirmText}
                isDangerous={modalConfig.isDangerous}
                isLoading={modalConfig.isLoading}
                onConfirm={() => modalConfig.action()}
                onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
