"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
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
import { RichTextEditor } from "@/components/rich-text-editor";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    content: z.string().min(10, "Content must be at least 10 characters"),
});

export default function CreatePostPage() {
    const router = useRouter();
    const createPost = useMutation(api.posts.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
        },
    });

    const handleImageUpload = async (file: File) => {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        // Construct URL. In production, use a helper.
        // Local dev: usually http://localhost:3210/api/storage/...
        // But better to use `api.files.getUrl`?
        // For now, I'll return the storageId and let the Image component load it?
        // Tiptap Image extension needs a src URL.
        // I can return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`
        return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await createPost({
                title: values.title,
                slug: values.slug,
                content: values.content,
                published: true, // Auto-publish for now
            });
            router.push("/dashboard"); // Redirect to dashboard
        } catch (error) {
            console.error("Failed to create post", error);
            // Ideally show toast error
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create New Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Post title" {...field} onChange={(e) => {
                                                field.onChange(e);
                                                // Auto-generate slug from title if slug is empty
                                                if (!form.getValues("slug")) {
                                                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                                    form.setValue("slug", slug);
                                                }
                                            }} />
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
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="post-slug" {...field} />
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
                                            <RichTextEditor
                                                content={field.value}
                                                onChange={field.onChange}
                                                onImageUpload={handleImageUpload}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Publishing..." : "Publish"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
