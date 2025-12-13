"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { FeaturedPosts } from "@/components/featured-posts";
import { PopularSidebar } from "@/components/popular-sidebar";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
// import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const posts = useQuery(api.posts.getRecent);

  return (
    <main className="min-h-screen bg-background pb-20">


      <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Create Post Section - Button Trigger */}
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

          <FeaturedPosts />

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts?.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  author={post.author || undefined}
                  liveViewers={Math.floor(Math.random() * 10)}
                  likesCount={Math.floor(Math.random() * 300)}
                  commentsCount={Math.floor(Math.random() * 50)}
                />
              ))}
              {!posts && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading articles...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 hidden lg:block">
          <PopularSidebar />
        </aside>

      </div>
    </main>
  );
}
