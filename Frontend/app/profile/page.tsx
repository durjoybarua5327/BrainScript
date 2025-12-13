"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, MessageSquare, FileText, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const myPosts = useQuery(api.posts.getMyPosts);
    const myStats = useQuery(api.posts.getMyStats);
    const savedPosts = useQuery(api.saves.getSavedPosts);

    if (!isLoaded) {
        return (
            <div className="container mx-auto py-20 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
                <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container py-8">
                {/* Profile Header */}
                <div className="bg-card border rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback className="text-2xl">{user.firstName?.[0] || user.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{user.fullName || user.username}</h1>
                            <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalPosts || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalViews || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalLikes || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalComments || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Posts and Saved */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="posts">My Posts</TabsTrigger>
                        <TabsTrigger value="saved">Saved Posts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-6">
                        <div className="space-y-4">
                            {myPosts && myPosts.length > 0 ? (
                                myPosts.map((post) => (
                                    <Link key={post._id} href={`/posts/${post.slug}`}>
                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
                                                            {post.title}
                                                        </h3>
                                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" /> {post.views}
                                                            </span>
                                                            <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant={post.published ? "default" : "secondary"}>
                                                        {post.published ? "Published" : "Draft"}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No posts yet. Start writing!</p>
                                    <Link href="/dashboard/create" className="text-blue-600 hover:underline mt-2 inline-block">
                                        Create your first post
                                    </Link>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="mt-6">
                        <div className="space-y-4">
                            {savedPosts && savedPosts.length > 0 ? (
                                savedPosts.map((post) => (
                                    <Link key={post._id} href={`/posts/${post.slug}`}>
                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
                                                            {post.title}
                                                        </h3>
                                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                                            <span>By {post.author?.name || "Unknown"}</span>
                                                            <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No saved posts yet. Start bookmarking!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
