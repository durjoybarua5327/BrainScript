import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Create a notification (Internal use only)
export const create = internalMutation({
    args: {
        recipientId: v.id("users"),
        senderId: v.id("users"),
        type: v.union(v.literal("like"), v.literal("comment")),
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            recipientId: args.recipientId,
            senderId: args.senderId,
            type: args.type,
            postId: args.postId,
            read: false,
        });
    },
});

// Get notifications for the current user
export const get = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return [];

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
            .order("desc")
            .collect();

        // Join with sender details and post details
        return Promise.all(
            notifications.map(async (n) => {
                const sender = await ctx.db.get(n.senderId);
                const post = await ctx.db.get(n.postId);
                return {
                    ...n,
                    senderName: sender?.name || "Unknown User",
                    senderImage: sender?.image,
                    postTitle: post?.title || "Deleted Post",
                    postSlug: post?.slug,
                };
            })
        );
    },
});

// Get unread count
export const getUnreadCount = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_recipient_read", (q) => q.eq("recipientId", user._id).eq("read", false))
            .collect();

        return unread.length;
    },
});

// Mark a single notification as read
export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.recipientId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.notificationId, { read: true });
    },
});

// Mark all as read
export const markAllAsRead = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_recipient_read", (q) => q.eq("recipientId", user._id).eq("read", false))
            .collect();

        for (const n of unread) {
            await ctx.db.patch(n._id, { read: true });
        }
    },
});

// Delete a notification
export const deleteNotification = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (!user) throw new Error("User not found");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.recipientId !== user._id) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.notificationId);
    },
});
