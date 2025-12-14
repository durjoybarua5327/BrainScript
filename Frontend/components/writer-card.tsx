"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";

interface WriterCardProps {
    author: {
        _id?: string;
        name?: string;
        image?: string;
        bio?: string;
        stats?: {
            posts: number;
            comments?: number;
            views?: number;
        };
    };
}

export function WriterCard({ author }: WriterCardProps) {
    return (
        <div className="bg-card w-full max-w-sm rounded-[32px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50 group">
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                {/* Optional: Overlay pattern or texture */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
            </div>

            {/* Avatar - Overlapping */}
            <div className="relative px-6 pt-0 pb-8 flex flex-col items-center -mt-16">
                <Avatar className="h-32 w-32 border-[6px] border-background shadow-md">
                    <AvatarImage src={author.image} alt={author.name} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-muted">{author.name?.[0]}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="text-center mt-4 space-y-3">
                    <h3 className="text-xl font-bold text-foreground">
                        {author.name || "Unknown Writer"}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mx-auto min-h-[60px]">
                        {author.bio || "Passionate writer exploring the world of technology and design."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 pt-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                            <BookOpen className="h-4 w-4" />
                            <span>{author.stats?.posts || 0} posts</span>
                        </div>
                        <div className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span>{author.stats?.comments || 0} comments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
