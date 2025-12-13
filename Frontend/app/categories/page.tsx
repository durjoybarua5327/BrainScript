"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
    { name: "Development", count: 45, color: "bg-blue-100 text-blue-700" },
    { name: "Design", count: 32, color: "bg-purple-100 text-purple-700" },
    { name: "AI & ML", count: 28, color: "bg-green-100 text-green-700" },
    { name: "Backend", count: 24, color: "bg-orange-100 text-orange-700" },
    { name: "DevOps", count: 18, color: "bg-red-100 text-red-700" },
    { name: "Mobile", count: 15, color: "bg-pink-100 text-pink-700" },
];

export default function CategoriesPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container py-12">
                <h1 className="text-4xl font-bold mb-8">Browse by Category</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link key={category.name} href={`/categories/${category.name.toLowerCase()}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-8 text-center">
                                    <Badge className={`${category.color} text-lg px-4 py-2 mb-4`}>
                                        {category.name}
                                    </Badge>
                                    <p className="text-muted-foreground">{category.count} articles</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
