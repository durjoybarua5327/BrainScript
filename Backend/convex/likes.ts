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

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("likes", {
                postId: args.postId,
                userId: user._id,
            });
        }
    }
});
