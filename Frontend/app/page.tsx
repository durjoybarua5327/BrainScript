"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PostCardWithData } from "@/components/post-card-with-data";
import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const posts = useQuery(api.posts.getRecent);
  const categories = useQuery(api.categories.list) || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, categories]);

  // Filter posts by category
  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts?.filter(post => post.category === selectedCategory);

  // Get featured posts (top 2 by views)
  const featuredPosts = posts?.slice().sort((a, b) => b.views - a.views).slice(0, 2) || [];

  // Get popular posts (top 5 by views)
  const popularPosts = posts?.slice().sort((a, b) => b.views - a.views).slice(0, 5) || [];

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Create Post Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Share your knowledge!</h3>
                <p className="text-blue-100">Write an article and inspire the community.</p>
              </div>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="secondary" size="lg" className="shadow-lg hover:shadow-xl transition-all">
                    <PenTool className="mr-2 h-4 w-4" />
                    Create Blog
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard/create">
                  <Button variant="secondary" size="lg" className="shadow-lg hover:shadow-xl transition-all">
                    <PenTool className="mr-2 h-4 w-4" />
                    Create Blog
                  </Button>
                </Link>
              </SignedIn>
            </CardContent>
          </Card>

          {/* Featured Posts */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-600">📌</span> Featured Posts
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post._id} post={post} />
              ))}
            </div>
          </section>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className="rounded-full whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Latest Articles */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts?.map((post) => (
                <PostCardWithData
                  key={post._id}
                  post={post}
                  author={post.author || undefined}
                />
              ))}
              {!filteredPosts && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading articles...
                </div>
              )}
              {filteredPosts && filteredPosts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No articles in this category yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6 hidden lg:block">
          {/* Popular Posts */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Popular Posts</h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <PopularPostItem key={post._id} post={post} index={index + 1} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 px-3 py-1"
                    onClick={() => setSelectedCategory(category)}
                  >
                    #{category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="bg-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Subscribe to Newsletter</h3>
              <p className="text-blue-100 text-sm mb-4">
                Get the latest articles delivered to your inbox
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function FeaturedPostCard({ post }: { post: any }) {
  const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;

  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="group relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

        {/* Category Badge */}
        {post.category && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              {post.category}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(post._creationTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
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

function PopularPostItem({ post, index }: { post: any; index: number }) {
  const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;

  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="flex gap-3 group cursor-pointer">
        <span className="text-2xl font-bold text-muted-foreground/20 leading-none">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {post.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {likesCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
