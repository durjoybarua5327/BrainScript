"use client";

import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ViewCounter } from "@/components/view-counter";
import { LikeButton } from "@/components/like-button";
import { CommentsSection } from "@/components/comments-section";
import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PostPageClient({ slug }: { slug: string }) {
    const { user, isLoaded } = useUser();
    const post = useQuery(api.posts.getBySlug, { slug: slug });

    if (isLoaded && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Sign in to view this post</h2>
                    <p className="text-muted-foreground">Join the community to read full articles.</p>
                    <SignInButton mode="modal">
                        <Button size="lg">Sign In</Button>
                    </SignInButton>
                </div>
            </div>
        );
    }

    if (post === undefined) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (post === null) {
        return <div className="container mx-auto py-10">Post not found.</div>;
    }

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Mockup Breadcrumb placeholder or Back link */}
            <div className="container py-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-1">
                    ← Back to home
                </Link>
            </div>

            <header className="container max-w-4xl py-10 text-center">
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Development</Badge>
                    <Badge variant="outline" className="text-muted-foreground">#React</Badge>
                    <Badge variant="outline" className="text-muted-foreground">#TypeScript</Badge>
                    <Badge variant="outline" className="text-muted-foreground">#Architecture</Badge>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between border-y py-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={post.author?.image} />
                            <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="font-bold text-foreground">{post.author?.name || "Unknown Author"}</p>
                            <p className="text-xs text-muted-foreground">12/10/2024 · 8 min read</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <ViewCounter postId={post._id} />
                        <LikeButton postId={post._id} />
                        <SaveButton postId={post._id} />
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
                        </Button>
                    </div>
                </div>
            </header>

            {/* AI Summary Box */}
            <div className="container max-w-3xl mb-12">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-xl p-6">
                    <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2 flex items-center gap-2">
                        ✨ AI-Generated Summary
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        This article explores modern patterns for building scalable React applications, focusing on component architecture, state management strategies, and performance optimization techniques. Key takeaways include the importance of folder structure, custom hooks, and strict typing with TypeScript.
                    </p>
                </div>
            </div>

            <div className="container max-w-3xl px-4">
                <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-relaxed text-foreground/90">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <div className="mt-16 pt-10 border-t">
                    <h3 className="text-2xl font-bold mb-8">Discussion</h3>
                    <CommentsSection postId={post._id} />
                </div>
            </div>
        </article>
    );
}
