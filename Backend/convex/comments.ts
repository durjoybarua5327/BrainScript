import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByPost = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        // We want user details too.
        // This is N+1 if naive. 
        // Convex query is fast, but better to join manually.
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .order("desc")
            .collect();

        // Map to get authors
        return Promise.all(
            comments.map(async (c) => {
                const author = await ctx.db.get(c.userId);
                return {
                    ...c,
                    author,
                };
            })
        );
    },
});


export const getCount = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();
        return comments.length;
    }
});


export const create = mutation({
    args: {
        postId: v.id("posts"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.insert("comments", {
            postId: args.postId,
            userId: user._id,
            content: args.content,
        });
    }
});

export const update = mutation({
    args: {
        commentId: v.id("comments"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const comment = await ctx.db.get(args.commentId);
        if (!comment) throw new Error("Comment not found");

        if (comment.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.commentId, {
            content: args.content,
        });
    }
});

export const deleteComment = mutation({
    args: {
        commentId: v.id("comments"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const comment = await ctx.db.get(args.commentId);
        if (!comment) throw new Error("Comment not found");

        if (comment.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.commentId);
    }
});
