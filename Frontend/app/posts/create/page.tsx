'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Editor from "@/components/Editor";
import ImageUpload from "@/components/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";

// Categories (could be fetched from backend, but hardcoded for now or we can allow new ones)
const CATEGORIES = [
    "Technology",
    "Lifestyle",
    "Education",
    "Health",
    "Travel",
    "Business",
    "Entertainment",
    "Science"
];

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    category: z.string().min(1, {
        message: "Please select a category.",
    }),
    content: z.string().min(20, {
        message: "Content must be at least 20 characters.",
    }),
    coverImageId: z.string().optional(),
});

export default function CreatePostPage() {
    const { toast } = useToast();
    const router = useRouter();
    const createPost = useMutation(api.posts.create);
    const convex = useConvex();
    const [submitting, setSubmitting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Asynchronous validation for title uniqueness
    const checkTitleUnique = async (title: string) => {
        // Debounce logic is handled by hook form's mode usually, 
        // but for async validation in Zod, it runs on every match.
        // We might want to delay this check or only run onBlur.
        // For now, simpler implementation:
        const taken = await convex.query(api.posts.checkTitle, { title });
        return !taken;
    };

    // Extended schema with async refinement
    const extendedSchema = formSchema.refine(
        async (data) => await checkTitleUnique(data.title),
        {
            message: "Title already exists",
            path: ["title"],
        }
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(extendedSchema),
        defaultValues: {
            title: "",
            content: "",
            category: "",
        },
        mode: "onBlur", // Validate on blur to reduce async calls
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.coverImageId) {
            toast({
                title: "Cover Image Required",
                description: "Please upload a cover image for your blog post.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            await createPost({
                title: values.title,
                slug: values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), // Simple slug generation
                content: values.content,
                category: values.category,
                coverImageId: values.coverImageId as any, // ID naming convention
                published: true, // Auto-publish for now
                excerpt: values.content.replace(/<[^>]*>?/gm, '').slice(0, 150) + "...",
            });

            toast({
                title: "Post created",
                description: "Your blog post has been successfully published!",
            });

            router.push('/'); // Redirect to feed
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const { getValues } = form;

    if (previewMode) {
        const values = getValues();
        return (
            <div className="container max-w-4xl mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Preview</h1>
                    <Button variant="outline" onClick={() => setPreviewMode(false)}>
                        Back to Edit
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-4xl">{values.title || "Untitled Post"}</CardTitle>
                        <CardDescription className="flex gap-2 mt-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                                {values.category || "Uncategorized"}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {values.coverImageId && (
                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-muted-foreground">
                                {/* We can't easily show the image here without resolving the ID or passing the preview URL from ImageUpload */}
                                {/* For a real app, we'd hoist the preview URL state or fetch the image URL */}
                                [Cover Image Preview]
                            </div>
                        )}
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: values.content }}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Blog Post</CardTitle>
                    <CardDescription>Share your thoughts with the world.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your post title..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Must be unique and at least 5 characters.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className="w-full justify-between" role="combobox">
                                                        {field.value || "Select a category"}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full p-0">
                                                {CATEGORIES.map((category) => (
                                                    <DropdownMenuItem
                                                        key={category}
                                                        onSelect={() => field.onChange(category)}
                                                    >
                                                        {category}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="coverImageId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Editor
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPreviewMode(true)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Publish
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
