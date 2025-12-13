import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// We'll store presence in a separate table "presence"
// But defineTable in schema.ts is best.
// For now, I'll update schema.ts to include presence table.
// Wait, I can't edit schema.ts easily without potentially breaking existing data if strict.
// But dev mode handles it.
// I'll update schema.ts first in next step.
// Actually, I can use "defineSchema" in `schema.ts`.
// I will just write the schema update to `convex/schema.ts` first.
// Oh wait, I am writing `presence.ts` here.
// I'll write the heartbeat function assuming the table exists.

export const heartbeat = mutation({
    args: {
        postId: v.id("posts"),
        user: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Basic presence: simple "last seen" check
        // We can insert/update a record.
        // Ideally we use a `presence` table.

        // For simplicity in this demo, let's just increment `views` on post for now?
        // No, "Live Viewers" is ephemeral.

        // I need a schema update.
        // I will return "Schema update needed" if I can't run it.
        // But I will create the file assuming schema update comes next.

        const existing = await ctx.db
            .query("presence")
            .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("user", args.user || "anon")) // Need user ID or session ID
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { updated: Date.now() });
        } else {
            await ctx.db.insert("presence", {
                postId: args.postId,
                user: args.user || "anon",
                updated: Date.now(),
            });
        }
    },
});

export const getViewerCount = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        // Count users active in last 60 seconds
        const now = Date.now();
        const recent = await ctx.db
            .query("presence")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .filter((q) => q.gt(q.field("updated"), now - 60000))
            .collect();
        return recent.length;
    }
});
