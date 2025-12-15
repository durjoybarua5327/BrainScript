"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Heart, Calendar, ArrowRight, Layers, Hash, Clock, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCategory = searchParams.get("category") || "All";
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("latest");

    const categoriesData = useQuery(api.posts.getCategories);
    const tagsData = useQuery(api.posts.getTags);
    const posts = useQuery(api.posts.getPosts, {
        category: selectedCategory,
        tags: selectedTags,
        sortBy: sortBy
    });

    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) {
            setSelectedCategory(cat);
        } else {
            setSelectedCategory("All");
        }
    }, [searchParams]);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        if (category === "All") {
            router.push("/categories", { scroll: false });
        } else {
            router.push(`/categories?category=${encodeURIComponent(category)}`, { scroll: false });
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Construct sidebar categories including "All"
    const allCategories = [
        { name: "All", count: categoriesData?.reduce((acc, c) => acc + c.count, 0) || 0 },
        ...(categoriesData || [])
    ];

    const sortOptions = [
        { id: "latest", label: "Latest", icon: Clock },
        { id: "popular", label: "Popular", icon: Star },
        { id: "trending", label: "Trending", icon: TrendingUp },
    ];

    return (
        <main className="min-h-screen bg-background/50 pb-20">


            <div className="container py-8 flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar - Categories Navbar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-32 space-y-8">
                        {/* Categories Group */}
                        <div className="bg-card rounded-xl border shadow-sm p-4">
                            <div className="font-semibold mb-4 px-2 flex items-center gap-2">
                                <Hash className="h-4 w-4 text-primary" />
                                Topics
                            </div>
                            <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                                {categoriesData === undefined ? (
                                    // Loading skeletons
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                                    ))
                                ) : (
                                    allCategories.map((cat) => (
                                        <button
                                            key={cat.name}
                                            onClick={() => handleCategoryClick(cat.name)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                selectedCategory === cat.name
                                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md scale-[1.02]"
                                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                            )}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "ml-2 text-xs",
                                                    selectedCategory === cat.name
                                                        ? "bg-white/20 text-white hover:bg-white/30"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {cat.count}
                                            </Badge>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Tags Group */}
                        <div className="bg-card rounded-xl border shadow-sm p-4">
                            <div className="font-semibold mb-4 px-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    Popular Tags
                                </div>
                                {selectedTags.length > 0 && (
                                    <button
                                        onClick={() => setSelectedTags([])}
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar content-start">
                                {tagsData === undefined ? (
                                    // Loading skeletons
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-6 w-12 bg-muted/50 rounded-full animate-pulse" />
                                    ))
                                ) : tagsData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground px-2">No tags available</p>
                                ) : (
                                    tagsData.map((tag) => (
                                        <Badge
                                            key={tag.name}
                                            variant={selectedTags.includes(tag.name) ? "secondary" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-all duration-200 hover:scale-105 shrink-0 mb-1",
                                                selectedTags.includes(tag.name)
                                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0"
                                                    : "hover:bg-secondary hover:text-secondary-foreground"
                                            )}
                                            onClick={() => toggleTag(tag.name)}
                                        >
                                            {tag.name}
                                            {selectedTags.includes(tag.name) && (
                                                <span className="ml-1 text-[10px] opacity-70">
                                                    ×
                                                </span>
                                            )}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content - Post List */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            {selectedCategory === "All" ? "All Articles" : selectedCategory}
                            <span className="text-sm md:text-base font-normal text-muted-foreground">
                                ({posts?.length || 0})
                            </span>
                        </h2>

                        <div className="flex items-center bg-muted/30 border border-border/50 rounded-full p-1.5 shadow-inner">
                            {sortOptions.map((option) => {
                                const Icon = option.icon;
                                const isActive = sortBy === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id)}
                                        className={cn(
                                            "relative flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            isActive
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-sort-tab"
                                                className="absolute inset-0 bg-background shadow-md rounded-full border border-border/20"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className={cn("h-4 w-4", isActive && "text-blue-600")} />
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {posts === undefined ? (
                            // Loading skeletons for posts
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-64 rounded-xl bg-card border shadow-sm p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                                    <div className="w-full md:w-1/3 bg-muted rounded-lg" />
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-6 w-3/4 bg-muted rounded" />
                                        <div className="h-4 w-1/2 bg-muted rounded" />
                                        <div className="h-24 bg-muted rounded" />
                                    </div>
                                </div>
                            ))
                        ) : posts.length === 0 ? (
                            <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                    <Layers className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">No posts found</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        There are no posts in this category yet. Be the first to write one!
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link href="/dashboard/create">Write a Post</Link>
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {posts.map((post) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Link href={`/posts/${post.slug}`}>
                                                <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
                                                    <div className="flex flex-col md:flex-row md:min-h-[240px]">
                                                        {/* Image Section - 35% width on desktop */}
                                                        <div className="relative w-full md:w-[320px] lg:w-[380px] h-56 md:h-auto shrink-0 overflow-hidden">
                                                            {post.coverImageUrl ? (
                                                                <Image
                                                                    src={post.coverImageUrl}
                                                                    alt={post.title}
                                                                    fill
                                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                                                    <Layers className="h-12 w-12 text-white/50" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                                            {/* Category Badge overlay on mobile */}
                                                            {post.category && (
                                                                <div className="absolute top-4 left-4 md:hidden">
                                                                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                                                                        {post.category}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content Section */}
                                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-8 w-8 ring-2 ring-background">
                                                                            <AvatarImage src={post.author?.image} />
                                                                            <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-sm font-medium text-foreground/80">
                                                                            {post.author?.name}
                                                                        </span>
                                                                        <span className="text-muted-foreground text-xs">•</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {new Date(post._creationTime).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    {post.category && (
                                                                        <Badge variant="secondary" className="hidden md:inline-flex opacity-80 group-hover:opacity-100 transition-opacity">
                                                                            {post.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                                        {post.title}
                                                                    </h3>
                                                                    <p className="text-muted-foreground line-clamp-2 text-sm md:text-base leading-relaxed">
                                                                        {post.excerpt || "No description available for this post. Click to read more."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-6 mt-2 flex items-center justify-between border-t border-border/50">
                                                                <div className="flex items-center gap-6 text-muted-foreground text-xs md:text-sm">
                                                                    <div className="flex items-center gap-2 transition-colors hover:text-foreground">
                                                                        <Eye className="h-4 w-4" />
                                                                        <span>{post.views}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 transition-colors hover:text-foreground">
                                                                        <Heart className="h-4 w-4" />
                                                                        <span>{post.likesCount || 0}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 transition-colors hover:text-foreground">
                                                                        <MessageSquare className="h-4 w-4" />
                                                                        <span>{post.commentsCount || 0}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center text-primary text-xs md:text-sm font-medium group/btn">
                                                                    Read Article
                                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
