"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PostCardWithData } from "@/components/post-card-with-data";
import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Clock, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const posts = useQuery(api.posts.getRecent);
  const trendingPosts = useQuery(api.posts.getTrending);
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

  // Get featured posts (top 2 trending from last week)
  const featuredPosts = trendingPosts?.slice(0, 2) || [];

  // Get popular posts (top 5 by views)
  const popularPosts = posts?.slice().sort((a, b) => b.views - a.views).slice(0, 5) || [];

  // Extract unique tags from all posts
  const allTags = posts?.reduce((tags: string[], post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []) || [];

  // Get top 10 most popular tags
  const popularTags = allTags.slice(0, 10);

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
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
            <div className="space-y-10">
              {filteredPosts?.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
              {!filteredPosts && (
                <div className="text-center py-12 text-muted-foreground">
                  Loading articles...
                </div>
              )}
              {filteredPosts && filteredPosts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No articles in this category yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
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
            <CardContent className="p-3">
              <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.length > 0 ? (
                  popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                    >
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tags available yet.</p>
                )}
              </div>
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
        {/* Cover Image */}
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        )}

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

function ArticleCard({ post }: { post: any }) {
  const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;
  const commentsCount = useQuery(api.comments.getCount, { postId: post._id }) ?? 0;

  // Calculate reading time properly by stripping HTML
  const contentText = post.content?.replace(/<[^>]+>/g, ' ') || '';
  const wordCount = contentText.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Get description from excerpt or content
  const description = post.excerpt ||
    (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 150).trim() + (post.content.length > 150 ? "..." : "") : "");

  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <div className="flex flex-col sm:flex-row gap-6 sm:h-64 border border-border/60 rounded-2xl p-4 hover:border-blue-500/30 transition-all bg-card/30 hover:shadow-sm">
        {/* Image Section */}
        <div className="relative w-full sm:w-80 h-52 sm:h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex-shrink-0">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-3">
            {/* Category and Date */}
            <div className="flex items-center gap-3 text-sm">
              {post.category && (
                <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                  {post.category}
                </span>
              )}
              <span className="text-muted-foreground">
                {new Date(post._creationTime).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {post.title}
            </h3>

            {/* Excerpt/Description */}
            {description && (
              <p className="text-muted-foreground line-clamp-2 leading-relaxed text-sm sm:text-base">
                {description}
              </p>
            )}
          </div>

          {/* Footer with Author and Stats */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                {post.author?.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                    {post.author?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-foreground">
                {post.author?.name || 'Unknown Author'}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likesCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{commentsCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
