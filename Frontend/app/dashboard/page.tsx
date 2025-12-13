"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BarChart, FileText } from "lucide-react";

export default function DashboardPage() {
    // We need a query to get "my posts".
    // I'll assume we need to add `getMyPosts` to convex/posts.ts
    // For now, I'll use `getRecent` but filtered? No, better add `getMyPosts`.
    const posts = useQuery(api.posts.getRecent) || []; // Placeholder for now

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button asChild>
                    <Link href="/dashboard/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Post
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <p className="text-muted-foreground">No posts yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {posts.map((post) => (
                                <li key={post._id} className="border-b last:border-0 pb-4 last:pb-0 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{post.title}</h3>
                                        <p className="text-sm text-muted-foreground">{new Date(post._creationTime).toLocaleDateString()}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/posts/${post.slug}`}>View</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
