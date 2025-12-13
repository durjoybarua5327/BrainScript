"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Heart, Bookmark, Users } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useUser, SignInButton } from "@clerk/nextjs";

interface PostCardProps {
    post: {
        _id: Id<"posts">;
        _creationTime: number;
        title: string;
        slug: string;
        excerpt?: string;
        coverImageId?: Id<"_storage">;
        views: number;
        authorId: Id<"users">;
    };
    author?: {
        name?: string;
        image?: string;
    };
    liveViewers?: number;
    likesCount?: number;
    commentsCount?: number;
}

export function PostCard({ post, author, liveViewers = 0, likesCount = 0, commentsCount = 0 }: PostCardProps) {
    const { user } = useUser();

    const CardContent = (
        <div className="group relative overflow-hidden rounded-xl bg-card border-2 border-border hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
            {/* Cover Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                {post.coverImageId ? (
                    <div className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
                )}

                {/* Live Viewers Badge */}
                {liveViewers > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        <Users className="h-3 w-3" />
                        {liveViewers} watching
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={author?.image} />
                        <AvatarFallback className="text-sm">{author?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{author?.name || "Unknown Author"}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(post._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                {/* Tags - Placeholder */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-secondary/80">
                        React
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal hover:bg-secondary/80">
                        Web Dev
                    </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span>{commentsCount}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{likesCount}</span>
                        </button>
                        <button className="text-muted-foreground hover:text-blue-600 transition-colors">
                            <Bookmark className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!user) {
        return (
            <SignInButton mode="modal">
                {CardContent}
            </SignInButton>
        );
    }

    return (
        <Link href={`/posts/${post.slug}`}>
            {CardContent}
        </Link>
    );
}
