"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
// ... imports
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CommentsSection({ postId }: { postId: Id<"posts"> }) {
    const comments = useQuery(api.comments.listByPost, { postId }) || [];
    const createComment = useMutation(api.comments.create);
    const updateComment = useMutation(api.comments.update);
    const deleteComment = useMutation(api.comments.deleteComment);
    const { user } = useUser();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<Id<"comments"> | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"comments"> | null>(null);

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (unchanged)
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await createComment({ postId, content });
            setContent("");
            toast({
                title: "Comment posted",
                description: "Your comment has been successfully posted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to post comment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (comment: any) => {
        setEditingId(comment._id);
        setEditContent(comment.content);
    };

    const handleUpdate = async (commentId: Id<"comments">) => {
        // ... (unchanged)
        if (!editContent.trim()) return;
        setIsUpdating(true);
        try {
            await updateComment({ commentId, content: editContent });
            setEditingId(null);
            setEditContent("");
            toast({
                title: "Comment updated",
                description: "Your comment has been successfully updated.",
            });
        } catch (error) {
            console.error("Failed to update comment:", error);
            toast({
                title: "Error",
                description: "Failed to update comment.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (commentId: Id<"comments">) => {
        setIsDeletingId(commentId);
        try {
            await deleteComment({ commentId });
            toast({
                title: "Comment deleted",
                description: "Your comment has been removed.",
            });
            setConfirmDeleteId(null);
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast({
                title: "Error",
                description: "Failed to delete comment.",
                variant: "destructive",
            });
        } finally {
            setIsDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 mt-10">
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
                    <div key={comment._id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.author?.image} />
                            <AvatarFallback>{comment.author?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{comment.author?.name || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment._creationTime).toLocaleDateString()}
                                    </span>
                                </div>
                                {user && comment.author?.email === user.emailAddresses[0]?.emailAddress && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                            onClick={() => handleEditClick(comment)}
                                            disabled={editingId === comment._id}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                            onClick={() => setConfirmDeleteId(comment._id)}
                                            disabled={isDeletingId === comment._id}
                                        >
                                            {isDeletingId === comment._id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {editingId === comment._id ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdate(comment._id)}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            ) : (
                                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingId(null)}
                                            disabled={isUpdating}
                                        >
                                            <X className="h-3.5 w-3.5 mr-1.5" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Comment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={!!isDeletingId}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                            disabled={!!isDeletingId}
                        >
                            {isDeletingId === confirmDeleteId ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
