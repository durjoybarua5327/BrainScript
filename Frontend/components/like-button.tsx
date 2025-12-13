"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function LikeButton({ postId }: { postId: Id<"posts"> }) {
    const likes = useQuery(api.likes.getCount, { postId }) || 0;
    const hasLiked = useQuery(api.likes.hasLiked, { postId });
    const toggleLike = useMutation(api.likes.toggle);

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1", hasLiked && "text-red-500 hover:text-red-600")}
            onClick={() => toggleLike({ postId })}
        >
            <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
            <span>{likes}</span>
        </Button>
    );
}
