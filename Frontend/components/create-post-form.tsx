"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Video, Code, Eye, Save, Send } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

const postSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    excerpt: z.string().max(200, "Excerpt must be less than 200 characters").optional(),
    published: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePostForm() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const createPost = useMutation(api.posts.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            excerpt: "",
            published: false,
        },
    });

    const title = watch("title");

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    // Handle cover image upload
    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("File must be an image");
                return;
            }
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle in-editor image upload
    const handleImageUpload = async (file: File) => {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
    };

    // Submit handler
    const onSubmit = async (data: PostFormData) => {
        if (!user) return;

        // Validate content length
        if (content.length < 50) {
            alert("Content must be at least 50 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            let coverImageId = undefined;

            // Upload cover image if provided
            if (coverImage) {
                const uploadUrl = await generateUploadUrl();
                const uploadResult = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": coverImage.type },
                    body: coverImage,
                });
                const { storageId } = await uploadResult.json();
                coverImageId = storageId;
            }

            // Create post
            await createPost({
                title: data.title,
                slug: generateSlug(data.title),
                content: content,
                excerpt: data.excerpt,
                coverImageId,
                published: data.published,
            });

            // Reset form
            reset();
            setContent("");
            setCoverImage(null);
            setCoverImagePreview(null);

            // Redirect to post if published, otherwise to dashboard
            if (data.published) {
                router.push(`/posts/${generateSlug(data.title)}`);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save as draft
    const saveDraft = async () => {
        const data = { ...watch(), published: false };
        await onSubmit(data);
    };

    // Publish post
    const publishPost = async () => {
        const data = { ...watch(), published: true };
        await onSubmit(data);
    };

    if (!isLoaded) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <h3 className="text-xl font-bold mb-4">Share Your Story</h3>
                    <p className="text-muted-foreground mb-6">Sign in to create and publish your blog posts</p>
                    <SignInButton mode="modal">
                        <Button className="bg-blue-600 hover:bg-blue-700">Sign In to Write</Button>
                    </SignInButton>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl">Create New Post</span>
                    </div>
                    <Badge variant="outline" className="font-normal text-sm">
                        {content.length} / 50 min
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                            <span className="text-blue-600">✍️</span> Title *
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter an engaging title that captures attention..."
                            {...register("title")}
                            className="text-lg font-semibold border-2 focus:border-blue-500 transition-colors h-12"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Label htmlFor="excerpt" className="text-base font-semibold flex items-center gap-2">
                            <span className="text-purple-600">📝</span> Excerpt (Optional)
                        </Label>
                        <Textarea
                            id="excerpt"
                            placeholder="Write a compelling summary that makes readers want to read more..."
                            {...register("excerpt")}
                            rows={3}
                            className="border-2 focus:border-purple-500 transition-colors resize-none"
                        />
                        {errors.excerpt && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {errors.excerpt.message}
                            </p>
                        )}
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <Label htmlFor="coverImage" className="text-base font-semibold flex items-center gap-2">
                            <span className="text-green-600">🖼️</span> Cover Image (Optional)
                        </Label>
                        <div className="border-2 border-dashed rounded-lg p-6 hover:border-blue-500 transition-colors bg-muted/30">
                            <div className="flex flex-col items-center gap-4">
                                {coverImagePreview ? (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-blue-500 shadow-md">
                                        <img
                                            src={coverImagePreview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                                setCoverImage(null);
                                                setCoverImagePreview(null);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ImagePlus className="h-12 w-12 text-muted-foreground" />
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Drag and drop or click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </>
                                )}
                                <Input
                                    id="coverImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="max-w-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Editor with Tabs */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <span className="text-orange-600">✨</span> Content *
                        </Label>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-12">
                                <TabsTrigger value="write" className="text-base">
                                    <Code className="h-4 w-4 mr-2" />
                                    Write
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="text-base">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="write" className="mt-4">
                                <div className="border-2 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
                                    <RichTextEditor
                                        content={content}
                                        onChange={setContent}
                                        onImageUpload={handleImageUpload}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="preview" className="mt-4">
                                <div className="min-h-[400px] p-8 border-2 rounded-lg bg-gradient-to-br from-background to-muted/30 shadow-inner">
                                    {title && (
                                        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {title}
                                        </h1>
                                    )}
                                    <div
                                        className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-a:text-blue-600"
                                        dangerouslySetInnerHTML={{
                                            __html: content || "<p class='text-muted-foreground italic'>Start writing to see your preview here...</p>"
                                        }}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                        {content.length < 50 && content.length > 0 && (
                            <p className="text-sm text-amber-600 flex items-center gap-1">
                                <span>💡</span> {50 - content.length} more characters needed
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={saveDraft}
                            disabled={isSubmitting || !title}
                            className="border-2 hover:bg-muted"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button
                            type="button"
                            onClick={publishPost}
                            disabled={isSubmitting || content.length < 50 || !title}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Publishing..." : "Publish Post"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
