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
            // We do not overwrite name/image here to respect user changes
            /*
            await ctx.db.patch(existing._id, {
                name: args.name,
                image: args.image,
            });
            */
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
            totalComments: posts.reduce((acc, output) => acc + (output.comments?.length || output.commentsCount || 0), 0),
        };

        const recentPosts = posts.slice(0, 20);

        return {
            ...user,
            stats,
            // Return recent posts for the profile page
            posts: await Promise.all(recentPosts.map(async (post) => {
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

export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();
    }
});
export const update = mutation({
    args: {
        name: v.optional(v.string()),
        passion: v.optional(v.string()),
        interest: v.optional(v.string()),
        organization: v.optional(v.string()),
        imageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const updates: any = {
            ...(args.name && { name: args.name }),
            ...(args.passion && { passion: args.passion }),
            ...(args.interest && { interest: args.interest }),
            ...(args.organization && { organization: args.organization }),
        };

        if (args.imageId) {
            updates.image = await ctx.storage.getUrl(args.imageId);
        }

        await ctx.db.patch(user._id, updates);

        return user._id;
    },
});

export const getSuggestions = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").order("desc").take(100);
        const passions = new Set<string>();
        const organizations = new Set<string>();

        users.forEach((u) => {
            if (u.passion) passions.add(u.passion);
            if (u.organization) organizations.add(u.organization);
        });

        return {
            passions: Array.from(passions).slice(0, 10),
            organizations: Array.from(organizations).slice(0, 10),
        };
    },
});


export const updateTheme = mutation({
    args: {
        theme: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            theme: args.theme,
        });

        return args.theme;
    },
});

export const getTopWriters = query({
    args: {},
    handler: async (ctx) => {
        // Optimization: Analyzes the last 100 posts to determine active top writers
        const posts = await ctx.db.query("posts").order("desc").take(100);
        const authorStats: Record<string, { posts: number; views: number; comments: number }> = {};

        for (const post of posts) {
            if (!authorStats[post.authorId]) {
                authorStats[post.authorId] = { posts: 0, views: 0, comments: 0 };
            }
            authorStats[post.authorId].posts++;
            authorStats[post.authorId].views += post.views;
            // Aggregate comments count if available (using array length or count field)
            const count = post.comments?.length || post.commentsCount || 0;
            authorStats[post.authorId].comments += count;
        }

        const sortedAuthorIds = Object.keys(authorStats)
            .sort((a, b) => authorStats[b].posts - authorStats[a].posts)
            .slice(0, 12);

        const writers = await Promise.all(sortedAuthorIds.map(async (id) => {
            const user = await ctx.db.get(id as any);
            if (!user) return null;
            return {
                ...user,
                stats: authorStats[id]
            };
        }));

        return writers.filter((w): w is NonNullable<typeof w> => w !== null);
    }
});
