"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActiveReadersProps {
    postId: Id<"posts">;
}

export default function ActiveReaders({ postId }: ActiveReadersProps) {
    const activeReaders = useQuery(api.presence.getPostReaders, { postId });
    const heartbeat = useMutation(api.presence.heartbeat);

    // Heartbeat effect
    useEffect(() => {
        const interval = setInterval(() => {
            // Only heartbeat if tab is visible
            if (document.visibilityState === "visible") {
                heartbeat({ postId });
            }
        }, 20000); // 20 seconds

        // Initial heartbeat
        if (document.visibilityState === "visible") {
            heartbeat({ postId });
        }

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                heartbeat({ postId });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [postId, heartbeat]);

    if (!activeReaders || activeReaders.length === 0) {
        return null;
    }

    const DISPLAY_LIMIT = 5;
    const extraCount = activeReaders.length - DISPLAY_LIMIT;
    const displayReaders = activeReaders.slice(0, DISPLAY_LIMIT);

    return (
        <div className="flex items-center gap-2 mb-6 animate-in fade-in duration-500">
            <span className="text-sm text-muted-foreground mr-2">Reading now:</span>
            <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300">
                <TooltipProvider>
                    {displayReaders.map((reader) => (
                        <Tooltip key={reader._id}>
                            <TooltipTrigger asChild>
                                <span>
                                    <Link href={`/profile/${reader._id}`}>
                                        <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer">
                                            <AvatarImage src={reader.image} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                {reader.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{reader.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>

                {extraCount > 0 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="h-8 w-8 rounded-full bg-muted/80 backdrop-blur-sm border-2 border-background flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-muted transition-colors z-10">
                                +{extraCount}
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Current Readers ({activeReaders.length})</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4 py-4">
                                    {activeReaders.map((reader) => (
                                        <Link
                                            key={reader._id}
                                            href={`/profile/${reader._id}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={reader.image} />
                                                <AvatarFallback>{reader.name?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">
                                                {reader.name}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
