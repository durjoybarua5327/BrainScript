import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
            .query("saves")
            .withIndex("by_user_post", (q) => q.eq("userId", user._id).eq("postId", args.postId))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { saved: false };
        } else {
            await ctx.db.insert("saves", {
                postId: args.postId,
                userId: user._id,
            });
            return { saved: true };
        }
    }
});

export const hasSaved = query({
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
            .query("saves")
            .withIndex("by_user_post", (q) => q.eq("userId", user._id).eq("postId", args.postId))
            .unique();

        return !!existing;
    }
});

export const getSavedPosts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return [];

        const saves = await ctx.db
            .query("saves")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        return Promise.all(
            saves.map(async (save) => {
                const post = await ctx.db.get(save.postId);
                if (!post) return null;
                const author = await ctx.db.get(post.authorId);
                return {
                    ...post,
                    author,
                };
            })
        ).then(posts => posts.filter(p => p !== null));
    }
});
