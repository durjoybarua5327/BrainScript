"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "./post-card";
import { Id } from "@/convex/_generated/dataModel";

interface PostCardWithDataProps {
    post: {
        _id: Id<"posts">;
        _creationTime: number;
        title: string;
        slug: string;
        excerpt?: string;
        coverImageId?: Id<"_storage">;
        coverImageUrl?: string | null;
        views: number;
        authorId: Id<"users">;
    };
    author?: {
        name?: string;
        image?: string;
    };
}

export function PostCardWithData({ post, author }: PostCardWithDataProps) {
    // Fetch real counts from database
    const likesCount = useQuery(api.likes.getCount, { postId: post._id }) ?? 0;
    const commentsCount = useQuery(api.comments.getCount, { postId: post._id }) ?? 0;

    return (
        <PostCard
            post={post}
            author={author}
            likesCount={likesCount}
            commentsCount={commentsCount}
            liveViewers={0}
        />
    );
}
