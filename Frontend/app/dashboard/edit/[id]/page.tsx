"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ImageUpload";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Bold,
    Italic,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading2,
    Link as LinkIcon,
    Tag,
    Hash,
    Sparkles,
    Send,
    X,
    FileText,
    Loader2
} from "lucide-react";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    category: z.string().min(1, "Category is mandatory. Please select a category."),
    coverImageId: z.string().min(1, "Cover image is mandatory. Please upload an image."),
    content: z.string().min(10, "Content must be at least 10 characters"),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    postType: z.string().optional(),
    // LeetCode-specific fields
    problemNumber: z.string().optional(),
    problemName: z.string().optional(),
    difficulty: z.string().optional(),
    leetcodeUrl: z.string().optional(),
    timeComplexity: z.string().optional(),
    spaceComplexity: z.string().optional(),
});

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as Id<"posts">;
    const post = useQuery(api.posts.getById, { postId });
    const updatePost = useMutation(api.posts.update);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const existingCategories = ["Technology", "Programming", "Design", "Tutorial"];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            slug: "",
            category: "",
            coverImageId: "",
            content: "",
            tags: [],
            excerpt: "",
            postType: "",
            problemNumber: "",
            problemName: "",
            difficulty: "",
            leetcodeUrl: "",
            timeComplexity: "",
            spaceComplexity: "",
        },
    });

    // Load post data when available
    useEffect(() => {
        if (post && !isLoaded) {
            form.reset({
                title: post.title || "",
                slug: post.slug || "",
                category: post.category || "",
                coverImageId: post.coverImageId || "",
                content: post.content || "",
                tags: post.tags || [],
                excerpt: post.excerpt || "",
                postType: post.postType || "",
                problemNumber: post.problemNumber || "",
                problemName: post.problemName || "",
                difficulty: post.difficulty || "",
                leetcodeUrl: post.leetcodeUrl || "",
                timeComplexity: post.timeComplexity || "",
                spaceComplexity: post.spaceComplexity || "",
            });
            setTags(post.tags || []);
            setIsLoaded(true);
        }
    }, [post, form, isLoaded]);

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag) && tags.length < 10) {
            const newTags = [...tags, tag];
            setTags(newTags);
            form.setValue("tags", newTags);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        form.setValue("tags", newTags);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await updatePost({
                postId: postId,
                title: values.title,
                slug: values.slug,
                content: values.content,
                category: values.category,
                coverImageId: values.coverImageId as any,
                published: true,
                excerpt: values.excerpt,
                postType: values.postType,
                tags: values.tags,
                problemNumber: values.problemNumber,
                problemName: values.problemName,
                difficulty: values.difficulty,
                leetcodeUrl: values.leetcodeUrl,
                timeComplexity: values.timeComplexity,
                spaceComplexity: values.spaceComplexity,
            });
            toast({
                title: "Success!",
                description: "Your post has been updated successfully",
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to update post:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const tagSuggestions = ["JavaScript", "React", "TypeScript", "CSS", "Node.js", "Python", "Web Development", "Tutorial"];

    // Show loading state
    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
                <div className="container max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Edit Post
                                </h1>
                                <p className="text-sm text-muted-foreground">Update your post details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmitting ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                            {/* Main Content */}
                            <div className="space-y-6">
                                {/* Title & Slug */}
                                <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                        Title *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter your post title..."
                                                            {...field}
                                                            className="text-lg py-6 border-2 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                        <LinkIcon className="w-4 h-4 text-slate-600" />
                                                        URL Slug
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2 border-2 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                            <span className="text-sm text-muted-foreground whitespace-nowrap">yoursite.com/posts/</span>
                                                            <Input placeholder="post-slug" {...field} className="border-0 focus-visible:ring-0 px-0" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Content Editor */}
                                <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Code className="w-5 h-5 text-indigo-600" />
                                            Content Editor
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <textarea
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            placeholder="Write your content here..."
                                                            className="w-full min-h-[600px] p-6 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none text-base leading-relaxed resize-none overflow-hidden bg-white dark:bg-slate-900"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Cover Image */}
                                <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-600" />
                                            Cover Image *
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <FormField
                                            control={form.control}
                                            name="coverImageId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Category */}
                                <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-orange-600" />
                                            Category *
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Select or create category"
                                                            {...field}
                                                            className="border-2 focus:border-orange-500 focus:ring-orange-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Tags */}
                                <Card className="border-2 border-purple-300 dark:border-purple-700 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-purple-600" />
                                            Topics / Hashtags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <Badge key={tag} className="bg-purple-100 text-purple-700">
                                                        <Hash className="w-3 h-3 mr-1" />
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-2 hover:bg-purple-300 rounded-full p-0.5"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Input
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag(tagInput);
                                                    }
                                                }}
                                                placeholder="Type a tag..."
                                                disabled={tags.length >= 10}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => addTag(tagInput)}
                                                disabled={!tagInput || tags.length >= 10}
                                                size="icon"
                                            >
                                                <Tag className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
