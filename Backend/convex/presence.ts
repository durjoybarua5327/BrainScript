import { mutation, query } from "./_generated/server";
// Force sync
import { v } from "convex/values";

// Update presence timestamp
export const heartbeat = mutation({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        let userRecord = null;

        if (identity) {
            userRecord = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", identity.email!))
                .unique();
        }

        const existingQuery = ctx.db.query("presence").withIndex("by_post", (q) => q.eq("postId", args.postId));

        // Manual filter for presence uniqueness
        // Since we changed schema to allow optional userId, using unique() on by_post_user might be tricky with nulls in index if not careful, 
        // but let's stick to logic: if userRecord exists, match userId. If not, match user="anon" (assuming simplified anon tracking for now per IP/session not available easily, or just "anon" aggregate).
        // Actually, without a session ID for anon users, all anons will clash. 
        // The error log showed `user: "anon"`. 
        // Let's assume for this fix we might just update "anon" entry or create one? 
        // The error implied `user: "anon"` was being inserted.

        let existing;
        if (userRecord) {
            existing = await ctx.db
                .query("presence")
                .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", userRecord._id))
                .unique();
        } else {
            // For anonymous users, we really need a session ID to track individuals.
            // But based on the error "user: 'anon'", it seems the client might be sending something or the logic was attempting this.
            // However, the client code `ActiveReaders` calls `heartbeat({ postId })` without args.
            // If the user is not logged in, `identity` is null.
            // If we just store one "anon" record per post, that's fine for "someone is reading", but bad for "5 people reading".
            // Given the limitations and the error, I will stick to the plan: support adding "anon". 
            // NOTE: Without a client-generated session ID, multiple anon users will just update the SAME "anon" record if we enforce uniqueness on (postId, 'anon').
            // Let's first try to look for an existing "anon" record.
            existing = await ctx.db
                .query("presence")
                .filter((q) => q.and(
                    q.eq(q.field("postId"), args.postId),
                    q.eq(q.field("user"), "anon")
                ))
                .first();
        }

        if (existing) {
            await ctx.db.patch(existing._id, { updated: Date.now() });
        } else {
            await ctx.db.insert("presence", {
                postId: args.postId,
                userId: userRecord ? userRecord._id : undefined,
                user: userRecord ? undefined : "anon",
                updated: Date.now(),
            });
        }
    },
});

// Get active readers (excluding author)
export const getPostReaders = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const now = Date.now();
        // Considered active if updated within last 30 seconds
        const ACTIVE_THRESHOLD = 30 * 1000;

        const post = await ctx.db.get(args.postId);
        if (!post) return [];

        // Fetch recent presence records
        // Note: Convex doesn't support complex filtering in `query` efficiently without `withIndex` + `filter`.
        // We use `by_post` and filter in memory since presence count per post is expected to be reasonable (or limit).
        // For scalability, we should use an index on `updated` but mixing with `postId` equality is tricky without composite index.
        // We added `by_post_updated` index.

        const recentPresence = await ctx.db
            .query("presence")
            .withIndex("by_post_updated", (q) => q.eq("postId", args.postId).gt("updated", now - ACTIVE_THRESHOLD))
            .order("desc")
            .take(20); // Limit to top 20 most recent

        // Filter out author and map to user details
        const readers = await Promise.all(
            recentPresence
                .filter((p) => p.userId !== post.authorId)
                .map(async (p) => {
                    if (p.userId) {
                        const user = await ctx.db.get(p.userId);
                        return user ? {
                            _id: user._id,
                            name: user.name || "Anonymous",
                            image: user.image,
                        } : null;
                    } else {
                        // Anonymous user
                        return {
                            _id: p._id as unknown as string, // Cast ID for display key
                            name: "Anonymous Reader",
                            image: undefined,
                        };
                    }
                })
        );

        return readers.filter((r) => r !== null);
    }
});
