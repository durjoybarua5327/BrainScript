import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.string(),
        coverImageId: v.optional(v.id("_storage")),
        excerpt: v.optional(v.string()),
        published: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const existingSlug = await ctx.db
            .query("posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (existingSlug) {
            throw new Error("Slug already exists");
        }

        return await ctx.db.insert("posts", {
            title: args.title,
            slug: args.slug,
            content: args.content,
            coverImageId: args.coverImageId,
            authorId: user._id,
            published: args.published,
            excerpt: args.excerpt,
            views: 0,
        });
    },
});

// Helper to get author for a post
async function getAuthor(ctx: any, authorId: any) {
    return await ctx.db.get(authorId);
}

export const getRecent = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("posts").order("desc").take(10);
        return Promise.all(posts.map(async (post) => {
            const author = await ctx.db.get(post.authorId);
            return { ...post, author };
        }));
    }
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const post = await ctx.db
            .query("posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();
        if (!post) {
            return null;
        }
        // Fetch author details
        const author = await ctx.db.get(post.authorId);
        return post ? { ...post, author } : null;
    },
});

export const getMyPosts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return [];

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_author", (q) => q.eq("authorId", user._id))
            .order("desc")
            .collect();

        return posts;
    }
});

export const getMyStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return null;

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_author", (q) => q.eq("authorId", user._id))
            .collect();

        const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

        const likesCount = await ctx.db
            .query("likes")
            .collect()
            .then(likes => likes.filter(like =>
                posts.some(post => post._id === like.postId)
            ).length);

        const commentsCount = await ctx.db
            .query("comments")
            .collect()
            .then(comments => comments.filter(comment =>
                posts.some(post => post._id === comment.postId)
            ).length);

        return {
            totalPosts: posts.length,
            totalViews,
            totalLikes: likesCount,
            totalComments: commentsCount,
        };
    }
});
