"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export function CommentsSection({ postId }: { postId: Id<"posts"> }) {
    const comments = useQuery(api.comments.listByPost, { postId }) || [];
    const createComment = useMutation(api.comments.create);
    const { user, isLoaded } = useUser();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        await createComment({ postId, content });
        setContent("");
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 mt-10">
            <h3 className="text-2xl font-bold">Comments</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </Button>
                </form>
            ) : (
                <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
                    Log in to leave a comment.
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4 p-4 border rounded-lg">
                        <Avatar>
                            <AvatarImage src={comment.author?.image} />
                            <AvatarFallback>{comment.author?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{comment.author?.name || "Unknown"}</span>
                                <span className="text-xs text-muted-foreground">{new Date(comment._creationTime).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
