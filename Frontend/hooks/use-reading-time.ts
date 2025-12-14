"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UseReadingTimeProps {
    postId: Id<"posts">;
    enabled?: boolean;
}

export function useReadingTime({ postId, enabled = true }: UseReadingTimeProps) {
    const trackReadTime = useMutation(api.posts.trackReadTime);
    const startTimeRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef<number>(0);

    // Send data to backend
    const sendReadTime = async () => {
        if (!startTimeRef.current && accumulatedTimeRef.current === 0) return;

        let currentSessionDuration = 0;
        if (startTimeRef.current) {
            currentSessionDuration = Date.now() - startTimeRef.current;
        }

        const totalDuration = accumulatedTimeRef.current + currentSessionDuration;

        if (totalDuration > 1000) { // Only send if > 1 second
            try {
                await trackReadTime({
                    postId,
                    durationMs: totalDuration,
                });
                // Reset after successful send
                accumulatedTimeRef.current = 0;
                if (document.visibilityState === "visible") {
                    startTimeRef.current = Date.now();
                } else {
                    startTimeRef.current = null;
                }
            } catch (error) {
                console.error("Failed to track read time:", error);
            }
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Start timer
        startTimeRef.current = Date.now();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                // User left tab: calculate time and store it
                if (startTimeRef.current) {
                    accumulatedTimeRef.current += Date.now() - startTimeRef.current;
                    startTimeRef.current = null;
                }
                // Attempt to send immediately when hiding
                sendReadTime();
            } else {
                // User returned: restart timer
                startTimeRef.current = Date.now();
            }
        };

        const handleBeforeUnload = () => {
            // Calculate final chunk
            if (startTimeRef.current) {
                accumulatedTimeRef.current += Date.now() - startTimeRef.current;
            }
            // We can't await here reliably, but we try (sendBeacon would be better but requires an API route)
            // Since we're using Convex, best effort:
            sendReadTime();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Optional: Periodic sync (every 30s) to avoid losing too much data on crash
        const interval = setInterval(sendReadTime, 30000);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            clearInterval(interval);
            // createdTime not needed here as sendReadTime handles logic
            if (startTimeRef.current) {
                accumulatedTimeRef.current += Date.now() - startTimeRef.current;
                startTimeRef.current = null;
            }
            sendReadTime();
        };
    }, [enabled, postId]);

    return null;
}
