import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCount = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();
        return likes.length;
    }
});

export const hasLiked = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return false;

        const existing = await ctx.db
            .query("likes")
            .withIndex("by_user_post", (q) => q.eq("userId", user._id).eq("postId", args.postId))
            .unique();

        return !!existing;
    }
});

export const toggle = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const existing = await ctx.db
            .query("likes")
            .withIndex("by_user_post", (q) => q.eq("userId", user._id).eq("postId", args.postId))
            .unique();

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if (existing) {
            await ctx.db.delete(existing._id);
            await ctx.db.patch(args.postId, {
                likes: Math.max(0, (post.likes || 0) - 1)
            });
        } else {
            await ctx.db.insert("likes", {
                postId: args.postId,
                userId: user._id,
            });
            await ctx.db.patch(args.postId, {
                likes: (post.likes || 0) + 1
            });

            if (post.authorId !== user._id) {
                await ctx.db.insert("notifications", {
                    recipientId: post.authorId,
                    senderId: user._id,
                    type: "like",
                    postId: args.postId,
                    read: false,
                });
            }
        }
    }
});
