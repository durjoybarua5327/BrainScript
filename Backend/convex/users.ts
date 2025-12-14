import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (user) {
            // Update user if needed in future
            return user._id;
        }

        return await ctx.db.insert("users", {
            email: args.email,
            name: args.name,
            image: args.image,
            role: "user",
        });
    },
});

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    }
});

export const upsertFromClerk = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = args.email
            ? await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", args.email!))
                .unique()
            : null;

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                image: args.image,
            });
        } else {
            await ctx.db.insert("users", {
                email: args.email,
                name: args.name,
                image: args.image,
                role: "user",
            });
        }
    },
});
export const getPublicProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_author", (q) => q.eq("authorId", args.userId))
            .order("desc")
            .collect();

        const stats = {
            totalPosts: posts.length,
            totalViews: posts.reduce((acc, output) => acc + output.views, 0),
            totalLikes: posts.reduce((acc, output) => acc + output.likes, 0),
        };

        return {
            ...user,
            stats,
            // Return recent posts for the profile page
            posts: await Promise.all(posts.map(async (post) => {
                const coverImageUrl = post.coverImageId
                    ? await ctx.storage.getUrl(post.coverImageId)
                    : null;
                return {
                    ...post,
                    coverImageUrl
                };
            }))
        };
    }
});
