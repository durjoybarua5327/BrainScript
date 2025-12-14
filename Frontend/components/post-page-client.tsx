"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ViewCounter } from "@/components/view-counter";
import { LikeButton } from "@/components/like-button";
import { CommentsSection } from "@/components/comments-section";
import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MessageSquare, Clock, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { PostActions } from "@/components/post-actions";
import { useReadingTime } from "@/hooks/use-reading-time";

export default function PostPageClient({ slug }: { slug: string }) {
    const { user, isLoaded } = useUser();
    const post = useQuery(api.posts.getBySlug, { slug: slug });
    const me = useQuery(api.users.getMe);

    // Track reading time if post exists
    useReadingTime({
        postId: post?._id!,
        enabled: !!post
    });

    const incrementView = useMutation(api.posts.incrementView);
    const hasIncrementedView = useRef(false);

    // Always call hooks unconditionally - pass skip option or handle null
    const likesCount = useQuery(
        api.likes.getCount,
        post ? { postId: post._id } : "skip"
    ) ?? 0;
    const commentsCount = useQuery(
        api.comments.getCount,
        post ? { postId: post._id } : "skip"
    ) ?? 0;

    // Increment view count when post is loaded (only once per session)
    useEffect(() => {
        if (post && !hasIncrementedView.current) {
            incrementView({ postId: post._id })
                .then(() => {
                    hasIncrementedView.current = true;
                })
                .catch((error) => {
                    console.error("Failed to increment view:", error);
                });
        }
    }, [post, incrementView]);



    if (post === undefined) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (post === null) {
        return <div className="container mx-auto py-10">Post not found.</div>;
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    return (
        <article className="min-h-screen bg-background">
            {/* Hero Section with Cover Image */}
            <div className="relative w-full h-[400px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {/* Cover Image */}
                {post.coverImageUrl && (
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}

                {/* Cover Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-background" />

                {/* React Logo or Pattern (decorative) */}
                <div className="absolute right-10 top-10 opacity-20">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-400">
                        <circle cx="12" cy="12" r="3" strokeWidth="0.5" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth="0.5" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" strokeWidth="0.5" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="container max-w-4xl -mt-32 relative z-10">
                {/* Content Card */}
                <div className="bg-background rounded-2xl shadow-2xl border p-8 md:p-12">
                    {/* Category and Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.category && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                                {post.category}
                            </Badge>
                        )}
                    </div>

                    {/* Author Info and Meta */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <Link
                            href={me?._id === post.authorId ? "/profile" : `/profile/${post.authorId}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                <AvatarImage src={post.author?.image} />
                                <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground hover:underline decoration-blue-500/30 underline-offset-4 decoration-2">{post.author?.name || "Unknown Author"}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{new Date(post._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </Link>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <LikeButton postId={post._id} />
                            <SaveButton postId={post._id} />
                            <PostActions postId={post._id} authorId={post.authorId} />
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                                </svg>
                            </Button>
                        </div>
                    </div>

                    {/* Views and Comments Count */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views} views</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-2xl font-bold tracking-tight mb-8 pb-8 border-b leading-tight">
                        {post.title}
                    </h1>



                    {/* Article Content */}
                    <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/90 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-zinc-100 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-50 prose-pre:p-4 prose-pre:rounded-lg [&_pre_code]:bg-transparent [&_pre_code]:text-inherit">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Related Topics */}
                    <RelatedPosts currentPostId={post._id} category={post.category} />

                    {/* Comments Section */}
                    <div className="mt-16 pt-10 border-t">
                        <h3 className="text-2xl font-bold mb-2">Comments ({commentsCount})</h3>
                        <CommentsSection postId={post._id} />
                    </div>
                </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-20" />
        </article>
    );
}

function RelatedPosts({ currentPostId, category }: { currentPostId: any; category?: string }) {
    const allPosts = useQuery(api.posts.getRecent);

    // Filter posts by same category and exclude current post
    const relatedPosts = allPosts
        ?.filter(post => post._id !== currentPostId && post.category === category)
        .slice(0, 3) || [];

    if (relatedPosts.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 pt-10 border-t">
            <h3 className="text-xl font-bold mb-6">Related Topics You Might Like</h3>
            <div className="space-y-3">
                {relatedPosts.map((post) => (
                    <Link
                        key={post._id}
                        href={`/posts/${post.slug}`}
                        className="block text-blue-600 hover:underline"
                    >
                        {post.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}
