"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
    const allPosts = useQuery(api.posts.getRecent);

    // Calculate category counts from posts
    const categoryData = allPosts?.reduce((acc, post) => {
        if (post.category) {
            if (!acc[post.category]) {
                acc[post.category] = 0;
            }
            acc[post.category]++;
        }
        return acc;
    }, {} as Record<string, number>) || {};

    // Convert to array and sort by count
    const categories = Object.entries(categoryData)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    // Color palette for categories
    const colors = [
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
        "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    ];

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Browse by Category</h1>
                    <p className="text-muted-foreground">
                        Explore articles organized by topics
                    </p>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={category.name}
                                href={`/?category=${encodeURIComponent(category.name)}`}
                            >
                                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                                    <CardContent className="p-8 text-center">
                                        <Badge className={`${colors[index % colors.length]} text-lg px-4 py-2 mb-4`}>
                                            {category.name}
                                        </Badge>
                                        <p className="text-muted-foreground">
                                            {category.count} {category.count === 1 ? 'article' : 'articles'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">
                                No categories yet. Create your first post to get started!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
