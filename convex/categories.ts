import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("posts").collect();
        const categorySet = new Set<string>();
        for (const post of posts) {
            if (post.category) {
                categorySet.add(post.category);
            }
        }
        return Array.from(categorySet);
    },
});
