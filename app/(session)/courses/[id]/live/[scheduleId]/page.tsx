"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    LiveKitRoom,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2, ArrowLeft } from "lucide-react";
import { generateLiveToken } from "@/services/api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ZoomStudio } from "@/components/live/ZoomStudio";

export default function LecturerLiveRoom() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const scheduleId = params.scheduleId as string;

    const [token, setToken] = useState("");
    const [roomName, setRoomName] = useState("");
    const [schedule, setSchedule] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://192.168.100.142:7880";

    useEffect(() => {
        const initRoom = async () => {
            try {
                const res = await generateLiveToken(scheduleId);
                setToken(res.token);
                setRoomName(res.roomName);
                setSchedule(res.schedule);
            } catch (err: any) {
                console.error(err);
                setError(err?.response?.data?.error || "Failed to join live session");
                toast.error("Could not access live session");
            } finally {
                setIsLoading(false);
            }
        };
        initRoom();
    }, [scheduleId]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-screen bg-zinc-950 text-white">
                <Loader2 size={40} className="animate-spin text-rose-500 mb-4" />
                <p className="text-sm font-medium text-zinc-400">Connecting to Broadcast Studio...</p>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-screen bg-zinc-950 text-white p-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
                    <ArrowLeft size={30} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Unable to Join Studio</h2>
                <p className="text-zinc-400 mb-6 text-center max-w-sm">{error}</p>
                <Link href={`/courses/${courseId}`} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors border border-zinc-700">
                    Return to Course
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-zinc-950 overflow-hidden fixed inset-0 z-50">
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={wsUrl}
                data-lk-theme="default"
                style={{ height: '100%', width: '100%' }}
            >
                <ZoomStudio
                    courseId={courseId}
                    scheduleId={scheduleId}
                    scheduleTitle={schedule?.title}
                    isHost={true}
                />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}

