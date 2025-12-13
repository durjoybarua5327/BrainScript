import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchAll = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const searchTerm = args.query.toLowerCase();

        // Search posts
        const allPosts = await ctx.db.query("posts").collect();
        const matchingPosts = allPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.excerpt?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);

        // Search users
        const allUsers = await ctx.db.query("users").collect();
        const matchingUsers = allUsers.filter(user =>
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm)
        ).slice(0, 3);

        return {
            posts: matchingPosts,
            users: matchingUsers,
        };
    }
});
