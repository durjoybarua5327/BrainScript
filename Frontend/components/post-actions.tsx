"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PostActionsProps {
    postId: Id<"posts">;
    authorId: Id<"users">;
}

export function PostActions({ postId, authorId }: PostActionsProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Get the current user's Convex ID to verify ownership
    const convexUser = useQuery(api.users.getUserByEmail,
        user?.emailAddresses?.[0]?.emailAddress
            ? { email: user.emailAddresses[0].emailAddress }
            : "skip"
    );

    const deletePost = useMutation(api.posts.deletePost);

    // If user is not logged in or doesn't match author, don't show actions
    if (!user || !convexUser || convexUser._id !== authorId) {
        return null;
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePost({ postId });
            toast({
                title: "Post deleted",
                description: "The post has been successfully deleted.",
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast({
                title: "Error",
                description: "Failed to delete post. Please try again.",
                variant: "destructive",
            });
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/edit/${postId}`}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                </Link>
            </Button>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
