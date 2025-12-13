"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Eye } from "lucide-react";

export function ViewCounter({ postId }: { postId: string }) {
    // We need to cast string to Id<"posts"> or rely on Convex to handle it if it matches ID format.
    // Ideally postId passed here is already an ID.
    const viewers = useQuery(api.presence.getViewerCount, { postId: postId as Id<"posts"> });
    const heartbeat = useMutation(api.presence.heartbeat);

    useEffect(() => {
        const interval = setInterval(() => {
            heartbeat({ postId: postId as Id<"posts"> });
        }, 20000); // Pulse every 20s

        // Initial heartbeat
        heartbeat({ postId: postId as Id<"posts"> });

        return () => clearInterval(interval);
    }, [postId, heartbeat]);

    if (viewers === undefined) return null;

    return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground" title="Live Viewers">
            <Eye className="h-4 w-4" />
            <span>{viewers}</span>
        </div>
    );
}
