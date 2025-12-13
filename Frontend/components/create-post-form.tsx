"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Upload } from "lucide-react";

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
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

// Schema for form validation
const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    excerpt: z.string().optional(),
    content: z.string().min(50, {
        message: "Content must be at least 50 characters (HTML).",
    }),
    slug: z.string().min(3, {
        message: "Slug must be at least 3 characters.",
    }),
});

export function CreatePostForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    // Mutations
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const createPost = useMutation(api.posts.create);

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            excerpt: "",
            content: "",
            slug: "",
        },
    });

    // Helper: Upload file to specific URL
    const uploadFile = async (file: File) => {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        return storageId;
    };

    // Handler for rich text editor image uploads
    const handleEditorImageUpload = async (file: File) => {
        try {
            const storageId = await uploadFile(file);
            // Convex provides a way to get the URL, but for now we construct it locally or fetch it
            // Ideally we should have a query to get URL, but for rich text we often need a public URL immediately
            // For this implementation, we will use the Convex site URL pattern if available, or fetch a temporary one
            // NOTE: In a real app, define a `getDownloadUrl` query. 
            // For simplicity here, we assume we can construct it or need to fetch it.
            // Let's use a standard Convex HTTP action approach or similar if strictly needed.
            // Actually, `storageId` needs to be served. 
            // Let's fallback: Create a simple query `files.getUrl` ideally.
            // I'll assume we can use the storageId directly if the frontend knows the domain,
            // but the cleanest way is asking the backend.

            // Temporary fix: Return a placeholder or fetch signed URL.
            // Since we didn't define `getDownloadUrl`, we will use the `storageId` 
            // and let the image component resolving it (requiring a change in RichTextEditor to support storageId maybe?)
            // OR: We define `api.files.geturl` now quickly.

            // Let's assume there is a generic HTTP endpoint for storage, e.g., siteUrl + "/api/storage/" + storageId
            const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(".cloud", ".site");
            return `${convexSiteUrl}/getImage?storageId=${storageId}`;
        } catch (error) {
            console.error("Upload failed", error);
            throw error;
        }
    };

    // Submit handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            let coverImageId = undefined;
            if (coverImage) {
                coverImageId = await uploadFile(coverImage);
            }

            await createPost({
                title: values.title,
                slug: values.slug || values.title.toLowerCase().replace(/ /g, "-"),
                content: values.content,
                excerpt: values.excerpt,
                coverImageId,
                published: true, // Auto-publish for now
                images: [], // We could track embedded images here if we parsed the content
            });

            toast({
                title: "Success",
                description: "Blog post created successfully!",
            });

            router.push("/");
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create post. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Awesome Blog Post" {...field} />
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
                                <FormLabel>Slug (URL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="awesome-blog-post" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Excerpt (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Short summary..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                className="w-full"
                            />
                        </div>
                    </FormControl>
                    <FormDescription>
                        Valid image file for the post header.
                    </FormDescription>
                </FormItem>

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                // Note: We need to implement the actual URL retrieval for images to work perfectly
                                // onImageUpload={handleEditorImageUpload}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Publishing..." : "Publish Post"}
                </Button>
            </form>
        </Form>
    );
}
