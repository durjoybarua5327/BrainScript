import { v } from "convex/values";
// Trigger API regeneration
import { mutation, query } from "./_generated/server";

const SUPER_ADMIN_EMAIL = "durjoybarua8115@gmail.com";

// Helper to check if user is admin
async function checkAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", identity.email!))
        .unique();

    if (!user || user.role !== "admin") {
        throw new Error("Permission denied. Admin role required.");
    }

    return user;
}

// 1. Bootstrap Super Admin (Safe to run multiple times, only affects specific email)
export const bootstrapSuperAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", SUPER_ADMIN_EMAIL))
            .unique();

        if (!user) {
            throw new Error(`User with email ${SUPER_ADMIN_EMAIL} not found. Please log in first.`);
        }

        if (user.role !== "admin") {
            await ctx.db.patch(user._id, { role: "admin" });
            return "Successfully promoted to Super Admin.";
        }

        return "Already an Admin.";
    },
});

// 2. Update User Role (Admin Only)
export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        newRole: v.union(v.literal("user"), v.literal("admin")),
    },
    handler: async (ctx, args) => {
        const caller = await checkAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new Error("Target user not found");
        }

        // PROTECTION: Cannot modify Super Admin
        if (targetUser.email === SUPER_ADMIN_EMAIL) {
            throw new Error("Action Forbidden: Cannot modify Super Admin account.");
        }

        // PROTECTION: Cannot demote yourself (optional, but good practice to prevent accidental lockout)
        if (targetUser._id === caller._id && args.newRole !== "admin") {
            // Exception: Super Admin calling this on themselves?
            // But existing check prevents modifying Super Admin.
            // If another Admin tries to demote themselves, it's allowed?
            // Let's allow admins to demote themselves if they want, but Super Admin is already protected above.
        }

        await ctx.db.patch(args.userId, { role: args.newRole });
        return `User ${targetUser.name} role updated to ${args.newRole}`;
    },
});

// 3. Delete User (Admin Only)
export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new Error("Target user not found");
        }

        // PROTECTION: Cannot delete Super Admin
        if (targetUser.email === SUPER_ADMIN_EMAIL) {
            throw new Error("Action Forbidden: Cannot delete Super Admin account.");
        }

        await ctx.db.delete(args.userId);

        // Cleanup associated data (optional but recommended)
        // Ideally, we should cascade delete posts, comments, etc.
        // For now, we just delete the user record as requested.

        return `User ${targetUser.name} deleted successfully.`;
    },
});

// 4. Get All Users (Admin Only)
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        const users = await ctx.db.query("users").collect();

        // Return users with relevant info, sorted by creation date
        return users
            .map((user) => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
                image: user.image,
                _creationTime: user._creationTime,
            }))
            .sort((a, b) => b._creationTime - a._creationTime);
    },
});

// 5. Get Admin Statistics (Admin Only)
export const getAdminStats = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const posts = await ctx.db.query("posts").collect();

        const totalUsers = users.length;
        const adminUsers = users.filter((u) => u.role === "admin").length;
        const regularUsers = totalUsers - adminUsers;
        const totalPosts = posts.length;

        return {
            totalUsers,
            adminUsers,
            regularUsers,
            totalPosts,
        };
    },
});
