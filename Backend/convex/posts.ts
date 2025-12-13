import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.string(),
        coverImageId: v.optional(v.id("_storage")),
        images: v.optional(v.array(v.string())),
        excerpt: v.optional(v.string()),
        published: v.boolean(),
        category: v.optional(v.string()),

        // New fields
        postType: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),

        // LeetCode fields
        problemNumber: v.optional(v.string()),
        problemName: v.optional(v.string()),
        difficulty: v.optional(v.string()),
        leetcodeUrl: v.optional(v.string()),
        timeComplexity: v.optional(v.string()),
        spaceComplexity: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // Debug: log identity to help diagnose authentication issues in Convex logs
        try {
            // eslint-disable-next-line no-console
            console.debug("Convex auth identity:", identity);
        } catch (e) {
            // ignore logging errors
        }
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        let user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        // Auto-create user if they don't exist
        if (!user) {
            const userId = await ctx.db.insert("users", {
                email: identity.email!,
                name: identity.name || identity.email!.split("@")[0],
                image: identity.pictureUrl,
                role: "user",
            });
            user = await ctx.db.get(userId);
        }

        if (!user) {
            throw new Error("Failed to create user");
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
            images: args.images,
            authorId: user._id,
            published: args.published,
            excerpt: args.excerpt,
            views: 0,
            category: args.category,
            likes: 0,
            comments: [],

            // New fields
            postType: args.postType,
            tags: args.tags,

            // LeetCode fields
            problemNumber: args.problemNumber,
            problemName: args.problemName,
            difficulty: args.difficulty,
            leetcodeUrl: args.leetcodeUrl,
            timeComplexity: args.timeComplexity,
            spaceComplexity: args.spaceComplexity,
        });
    },
});

export const update = mutation({
    args: {
        postId: v.id("posts"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImageId: v.optional(v.id("_storage")),
        images: v.optional(v.array(v.string())),
        excerpt: v.optional(v.string()),
        published: v.optional(v.boolean()),
        category: v.optional(v.string()),

        // New fields
        postType: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),

        // LeetCode fields
        problemNumber: v.optional(v.string()),
        problemName: v.optional(v.string()),
        difficulty: v.optional(v.string()),
        leetcodeUrl: v.optional(v.string()),
        timeComplexity: v.optional(v.string()),
        spaceComplexity: v.optional(v.string()),
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

        // Get the post to verify ownership
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Check if user is the author
        if (post.authorId !== user._id) {
            throw new Error("Unauthorized: You can only edit your own posts");
        }

        // If slug is being updated, check it doesn't already exist
        if (args.slug && args.slug !== post.slug) {
            const existingSlug = await ctx.db
                .query("posts")
                .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
                .unique();

            if (existingSlug) {
                throw new Error("Slug already exists");
            }
        }

        // Update the post
        const { postId, ...updateData } = args;
        await ctx.db.patch(args.postId, updateData);

        return args.postId;
    },
});

export const deletePost = mutation({
    args: {
        postId: v.id("posts"),
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

        // Get the post to verify ownership
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Check if user is the author
        if (post.authorId !== user._id) {
            throw new Error("Unauthorized: You can only delete your own posts");
        }

        // Delete associated comments
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        // Delete associated likes
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const like of likes) {
            await ctx.db.delete(like._id);
        }

        // Delete associated saves
        const saves = await ctx.db
            .query("saves")
            .collect()
            .then(saves => saves.filter(save => save.postId === args.postId));

        for (const save of saves) {
            await ctx.db.delete(save._id);
        }

        // Finally, delete the post
        await ctx.db.delete(args.postId);

        return { success: true };
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const checkTitle = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        // Simple check if any post has this title.
        // For a more robust slug check, we might want to check slugs, but prompt asked for title check.
        const post = await ctx.db
            .query("posts")
            .filter((q) => q.eq(q.field("title"), args.title))
            .first();
        return !!post;
    },
});

export const incrementView = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Increment the view count
        await ctx.db.patch(args.postId, {
            views: post.views + 1,
        });

        return post.views + 1;
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
            const coverImageUrl = post.coverImageId
                ? await ctx.storage.getUrl(post.coverImageId)
                : null;
            return { ...post, author, coverImageUrl };
        }));
    }
});

export const getTrending = query({
    args: {},
    handler: async (ctx) => {
        // Get posts from last 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentPosts = await ctx.db
            .query("posts")
            .filter((q) => q.gte(q.field("_creationTime"), oneWeekAgo))
            .collect();

        // Get engagement metrics for each post
        const postsWithEngagement = await Promise.all(
            recentPosts.map(async (post) => {
                const author = await ctx.db.get(post.authorId);
                const coverImageUrl = post.coverImageId
                    ? await ctx.storage.getUrl(post.coverImageId)
                    : null;

                // Count likes
                const likesCount = await ctx.db
                    .query("likes")
                    .withIndex("by_post", (q) => q.eq("postId", post._id))
                    .collect()
                    .then(likes => likes.length);

                // Count comments
                const commentsCount = await ctx.db
                    .query("comments")
                    .withIndex("by_post", (q) => q.eq("postId", post._id))
                    .collect()
                    .then(comments => comments.length);

                // Calculate engagement score
                const engagementScore = post.views + (likesCount * 2) + (commentsCount * 3);

                return {
                    ...post,
                    author,
                    coverImageUrl,
                    likesCount,
                    commentsCount,
                    engagementScore,
                };
            })
        );

        // Sort by engagement score and return top posts
        return postsWithEngagement
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 10);
    },
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
        const coverImageUrl = post.coverImageId
            ? await ctx.storage.getUrl(post.coverImageId)
            : null;
        return post ? { ...post, author, coverImageUrl } : null;
    },
});

export const getById = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) {
            return null;
        }
        // Fetch author details
        const author = await ctx.db.get(post.authorId);
        const coverImageUrl = post.coverImageId
            ? await ctx.storage.getUrl(post.coverImageId)
            : null;
        return { ...post, author, coverImageUrl };
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

        return Promise.all(posts.map(async (post) => {
            const coverImageUrl = post.coverImageId
                ? await ctx.storage.getUrl(post.coverImageId)
                : null;
            return { ...post, coverImageUrl };
        }));
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
