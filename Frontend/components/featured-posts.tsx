"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FeaturedPosts() {
    const posts = useQuery(api.posts.getRecent); // Use getRecent for now, ideally getFeatured

    if (!posts) return <div>Loading featured...</div>;

    const featured = posts.slice(0, 2); // Show top 2 as featured

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-blue-600">↗</span> Featured Posts
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                {featured.map((post) => (
                    <FeaturedPostCard key={post._id} post={post} />
                ))}
            </div>
        </section>
    );
}

function FeaturedPostCard({ post }: { post: any }) {
    const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;

    return (
        <Link href={`/posts/${post.slug}`}>
            <div className="group relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-md transition-all">
                {/* Cover Image */}
                <div className="aspect-video w-full bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
                    {post.coverImageUrl ? (
                        <Image
                            src={post.coverImageUrl}
                            alt={post.title}
                            fill
                            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
                    )}
                    {post.category && (
                        <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">{post.category}</Badge>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{likesCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
