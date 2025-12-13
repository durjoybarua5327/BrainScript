"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PopularSidebar() {
    // Fetch popular posts (sorted by views)
    const posts = useQuery(api.posts.getRecent);
    const categories = useQuery(api.categories.list);

    // Sort by views and take top 5
    const popularPosts = posts?.slice().sort((a, b) => b.views - a.views).slice(0, 5) || [];

    return (
        <div className="space-y-8">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Popular Posts</h3>
                <div className="space-y-6">
                    {popularPosts.length > 0 ? (
                        popularPosts.map((post, i) => (
                            <PopularPostItem key={post._id} post={post} index={i + 1} />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No posts yet</p>
                    )}
                </div>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {categories && categories.length > 0 ? (
                        categories.map(category => (
                            <Badge key={category} variant="secondary" className="hover:bg-secondary/80 cursor-pointer px-3 py-1 font-normal">
                                #{category}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No categories yet</p>
                    )}
                </div>
            </div>

            <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-2">Subscribe to Newsletter</h3>
                <p className="text-white/80 text-sm mb-4">Get the latest articles delivered to your inbox</p>
                {/* Form placeholder */}
            </div>
        </div>
    );
}

function PopularPostItem({ post, index }: { post: any; index: number }) {
    const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;

    return (
        <Link href={`/posts/${post.slug}`}>
            <div className="flex gap-4 items-start group cursor-pointer">
                <span className="text-3xl font-bold text-muted-foreground/20 leading-none">
                    {index}
                </span>
                <div>
                    <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {post.title}
                    </h4>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {likesCount}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
