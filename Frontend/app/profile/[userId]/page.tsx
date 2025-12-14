"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, FileText, Users, Heart, Eye, ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useRouter } from "next/navigation";

export default function ProfilePage({ params }: { params: { userId: string } }) {
    const router = useRouter();
    const profile = useQuery(api.users.getPublicProfile, { userId: params.userId as Id<"users"> });

    if (profile === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
                    <div className="h-64 bg-muted rounded-xl" />
                    <div className="h-32 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (profile === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">User not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Colors matching the gradient in the image
    const gradientClass = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";

    return (
        <main className="min-h-screen bg-background">
            {/* Header Banner */}
            <div className={`h-64 w-full ${gradientClass} relative`}>
                <div className="absolute top-4 left-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 hover:text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
                {/* Profile Card */}
                <div className="bg-card rounded-2xl shadow-xl border overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg rounded-full shrink-0">
                            <AvatarImage src={profile.image} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {profile.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h1 className="text-3xl font-bold">{profile.name}</h1>
                            <p className="text-muted-foreground max-w-2xl text-lg">
                                {/* Mock Bio if not in schema yet, or user role/title */}
                                {profile.role === "admin" ? "Administrator & Content Creator" : "Community Member & Writer"}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                                {profile.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        <span>{profile.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(profile._creationTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="border-t bg-muted/30 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-border/50">
                        <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-2 mb-1 text-primary">
                                <FileText className="w-5 h-5" />
                                <span className="text-2xl font-bold">{profile.stats.totalPosts}</span>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Articles</p>
                        </div>
                        <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-2 mb-1 text-purple-600">
                                <Users className="w-5 h-5" />
                                {/* Mock followers for now or 0 */}
                                <span className="text-2xl font-bold">{0}</span>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Followers</p>
                        </div>
                        <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-2 mb-1 text-red-500">
                                <Heart className="w-5 h-5" />
                                <span className="text-2xl font-bold">{profile.stats.totalLikes}</span>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Likes</p>
                        </div>
                        <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-2 mb-1 text-green-600">
                                <Eye className="w-5 h-5" />
                                <span className="text-2xl font-bold">{profile.stats.totalViews}</span>
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Views</p>
                        </div>
                    </div>
                </div>

                {/* Articles Section */}
                <div className="mt-12 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Articles by {profile.name?.split(' ')[0]}
                    </h2>

                    {profile.posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    author={{ name: profile.name, image: profile.image }}
                                    likesCount={post.likes}
                                    commentsCount={post.commentsCount}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No articles yet</h3>
                            <p className="text-muted-foreground mt-1">
                                This user hasn't published any articles yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
