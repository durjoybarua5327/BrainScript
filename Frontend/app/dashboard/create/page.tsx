"use client";

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
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor").then((mod) => mod.RichTextEditor), {
    ssr: false,
    loading: () => <div className="h-[600px] border rounded-md flex items-center justify-center bg-muted/10 text-muted-foreground">Loading Editor...</div>,
});
import ImageUpload from "@/components/ImageUpload";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
    Info
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

export default function CreatePostPage() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const createPost = useMutation(api.posts.create);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    // Check profile completeness
    const convexUser = useQuery(api.users.getMe);
    useEffect(() => {
        if (convexUser !== undefined) {
            const isProfileComplete = convexUser?.name && convexUser?.passion && convexUser?.interest && convexUser?.organization && convexUser?.image;

            if (convexUser && !isProfileComplete) {
                toast({
                    title: "Profile Incomplete",
                    description: "Please complete your profile details (Name, Passion, Interest, Organization) before creating a post.",
                    variant: "destructive",
                });
                router.push("/profile");
            }
        }
    }, [convexUser, router, toast]);

    // Mock data for demo
    const existingCategories = ["Technology", "Programming", "Design", "Tutorial"];
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    const handleImageUpload = async (file: File) => {
        // Mock implementation
        return URL.createObjectURL(file);
    };

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
        if (!isSignedIn) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to create a post",
                variant: "destructive",
            });
            console.warn("User not signed in");
            return;
        }

        console.log("Form values:", values);

        setIsSubmitting(true);
        try {
            console.log("Calling createPost mutation...");
            const postId = await createPost({
                title: values.title,
                slug: values.slug,
                content: values.content,
                category: values.category,
                coverImageId: values.coverImageId as any,
                published: true,
                excerpt: values.excerpt,

                // New fields
                postType: values.postType,
                tags: values.tags,

                // LeetCode fields
                problemNumber: values.problemNumber,
                problemName: values.problemName,
                difficulty: values.difficulty,
                leetcodeUrl: values.leetcodeUrl,
                timeComplexity: values.timeComplexity,
                spaceComplexity: values.spaceComplexity,
            });
            console.log("Post created successfully with ID:", postId);
            toast({
                title: "Success!",
                description: "Your post has been created successfully",
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to create post:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const tagSuggestions = ["JavaScript", "React", "TypeScript", "CSS", "Node.js", "Python", "Web Development", "Tutorial"];

    // Function to render markdown preview


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
                                    Create New Post
                                </h1>
                                <p className="text-sm text-muted-foreground">Share your knowledge with the community</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting || !isSignedIn}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmitting ? "Publishing..." : "Publish"}
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
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                if (!form.getValues("slug")) {
                                                                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                                                    form.setValue("slug", slug);
                                                                }
                                                            }}
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
                                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 sticky top-[85px] z-30">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Code className="w-5 h-5 text-indigo-600" />
                                                Content Editor
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={!showPreview ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setShowPreview(false)}
                                                    className={!showPreview ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                >
                                                    <Code className="w-4 h-4 mr-1" />
                                                    Write
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={showPreview ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setShowPreview(true)}
                                                    className={showPreview ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    Preview
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-2 space-y-4">
                                        {/* Rich Text Formatting Toolbar */}
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="space-y-4">
                                                            {showPreview ? (
                                                                <div className="h-[600px] overflow-y-auto p-6 border-2 rounded-lg bg-white dark:bg-slate-900 prose dark:prose-invert max-w-none prose-pre:bg-zinc-100 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-50 prose-pre:p-4 prose-pre:rounded-lg [&_pre_code]:bg-transparent [&_pre_code]:text-inherit">
                                                                    <div dangerouslySetInnerHTML={{ __html: field.value }} />
                                                                </div>
                                                            ) : (
                                                                <RichTextEditor
                                                                    content={field.value}
                                                                    onChange={field.onChange}
                                                                    onImageUpload={handleImageUpload}
                                                                />
                                                            )}
                                                        </div>
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
                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
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
                                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                                <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            Category *
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => {
                                                const filteredSuggestions = existingCategories.filter(cat =>
                                                    cat.toLowerCase().includes(field.value.toLowerCase()) &&
                                                    cat.toLowerCase() !== field.value.toLowerCase()
                                                );

                                                return (
                                                    <FormItem className="relative">
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder="Select or create category"
                                                                    {...field}
                                                                    className="border-2 focus:border-orange-500 focus:ring-orange-500"
                                                                    onFocus={() => setShowSuggestions(true)}
                                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                                />
                                                                {showSuggestions && filteredSuggestions.length > 0 && (
                                                                    <div className="absolute z-50 w-full mt-1 bg-popover border-2 rounded-lg shadow-xl max-h-60 overflow-auto">
                                                                        {filteredSuggestions.map((category) => (
                                                                            <div
                                                                                key={category}
                                                                                className="px-4 py-2.5 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-700 dark:hover:text-orange-300 transition-colors border-b last:border-b-0"
                                                                                onClick={() => {
                                                                                    field.onChange(category);
                                                                                    setShowSuggestions(false);
                                                                                }}
                                                                            >
                                                                                {category}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Tags / Topics / Hashtags */}
                                <Card className="border-2 border-purple-300 dark:border-purple-700 shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            Topics / Hashtags
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">Add up to 10 tags to help others discover your post</p>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {/* Display Tags */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/10 dark:to-pink-950/10 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                                                {tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/60 dark:hover:to-pink-900/60 pl-2 pr-1 py-1.5 text-sm font-medium border border-purple-300 dark:border-purple-700 shadow-sm"
                                                    >
                                                        <Hash className="w-3 h-3 mr-1" />
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-2 hover:bg-purple-300 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tag Input */}
                                        <div className="space-y-2">
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
                                                    placeholder="Type a tag and press Enter..."
                                                    disabled={tags.length >= 10}
                                                    className="border-2 focus:border-purple-500 focus:ring-purple-500"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => addTag(tagInput)}
                                                    disabled={!tagInput || tags.length >= 10}
                                                    size="icon"
                                                    className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                >
                                                    <Tag className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="font-semibold text-purple-600 dark:text-purple-400">{tags.length}/10</span> tags added
                                            </p>
                                        </div>

                                        {/* Suggested Tags */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-purple-600" />
                                                Suggested Tags:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {tagSuggestions.map((tag) => (
                                                    <Button
                                                        key={tag}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addTag(tag)}
                                                        disabled={tags.length >= 10 || tags.includes(tag)}
                                                        className="h-8 text-xs hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700 transition-all disabled:opacity-50"
                                                    >
                                                        <Hash className="w-3 h-3 mr-1" />
                                                        {tag}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sign In Prompt */}
                                {!isSignedIn && (
                                    <Card className="border-2 border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg">
                                        <CardContent className="pt-6">
                                            <div className="text-center space-y-3">
                                                <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                                    <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                                    Sign in required
                                                </p>
                                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                                    You must sign in to publish your post.
                                                </p>
                                                <SignInButton>
                                                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg transition-all">
                                                        Sign In Now
                                                    </Button>
                                                </SignInButton>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}