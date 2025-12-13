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
