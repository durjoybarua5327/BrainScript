"use client";

import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
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
import ImageUpload from "@/components/ImageUpload";

// Schema for form validation
const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    category: z.string().min(1, {
        message: "Please select a category.",
    }).refine((val) => val !== "", {
        message: "Category is mandatory.",
    }),
    excerpt: z.string().optional(),
    content: z.string().min(50, {
        message: "Content must be at least 50 characters (HTML).",
    }),
    slug: z.string().min(3, {
        message: "Slug must be at least 3 characters.",
    }),
    coverImageId: z.string().min(1, {
        message: "Cover image is mandatory. Please upload an image."
    }).refine((val) => val !== "", {
        message: "Cover image is required to publish.",
    }),
});

export function CreatePostForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isSignedIn } = useUser();

    // Fetch existing categories from backend for autocomplete suggestions
    const existingCategories = useQuery(api.categories.list) || [];
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Mutations
    const createPost = useMutation(api.posts.create);

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            category: "",
            excerpt: "",
            content: "",
            slug: "",
            coverImageId: "",
        },
    });

    // Submit handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!isSignedIn) {
            toast({
                title: "Not signed in",
                description: "Please sign in to publish a post.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await createPost({
                title: values.title,
                slug: values.slug || values.title.toLowerCase().replace(/ /g, "-"),
                content: values.content,
                excerpt: values.excerpt,
                coverImageId: values.coverImageId as any,
                category: values.category,
                published: true,
                images: [],
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
                    name="category"
                    render={({ field }) => {
                        const filteredSuggestions = existingCategories.filter(cat =>
                            cat.toLowerCase().includes(field.value.toLowerCase()) &&
                            cat.toLowerCase() !== field.value.toLowerCase()
                        );

                        return (
                            <FormItem className="relative">
                                <FormLabel>Category *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter category (e.g., Technology, Health)"
                                            {...field}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
                                        {showSuggestions && filteredSuggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                                                {filteredSuggestions.map((category) => (
                                                    <div
                                                        key={category}
                                                        className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
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

                <FormField
                    control={form.control}
                    name="coverImageId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Image *</FormLabel>
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

                <div className="flex items-center gap-3">
                    {!isSignedIn && (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Sign in to publish</p>
                            <SignInButton>
                                <Button>Sign in</Button>
                            </SignInButton>
                        </div>
                    )}

                    <Button type="submit" disabled={isSubmitting || !isSignedIn}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Publishing..." : "Publish Post"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
