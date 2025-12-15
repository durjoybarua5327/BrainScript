import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
        passion: v.optional(v.string()), // e.g. Student, Businessman, Job
        interest: v.optional(v.string()),
        organization: v.optional(v.string()),
        theme: v.optional(v.string()), // "light" or "dark" preference
    }).index("by_email", ["email"]),

    posts: defineTable({
        title: v.string(),
        slug: v.string(),
        content: v.string(), // HTML content
        coverImageId: v.optional(v.id("_storage")),
        authorId: v.id("users"),
        published: v.boolean(),
        excerpt: v.optional(v.string()),
        images: v.optional(v.array(v.string())), // Array of storage IDs
        views: v.number(),
        category: v.optional(v.string()),
        likes: v.number(),
        // We are keeping relational comments table, but adding this array as requested by prompt
        // ideally this should be a count or list of IDs if used for checking participation
        comments: v.optional(v.array(v.string())),

        // New fields
        postType: v.optional(v.string()), // "article", "leetcode", "tutorial"
        tags: v.optional(v.array(v.string())), // Array of tag strings

        // LeetCode specific fields
        problemNumber: v.optional(v.string()),
        problemName: v.optional(v.string()),
        difficulty: v.optional(v.string()), // "Easy", "Medium", "Hard"
        leetcodeUrl: v.optional(v.string()),
        timeComplexity: v.optional(v.string()), // e.g., "O(n)"
        spaceComplexity: v.optional(v.string()), // e.g., "O(1)"
        totalReadTimeMs: v.optional(v.number()), // Total time spent reading by all users
        commentsCount: v.optional(v.number()), // Denormalized comments count
    })
        .index("by_slug", ["slug"])
        .index("by_author", ["authorId"])
        .index("by_category", ["category"]),

    comments: defineTable({
        postId: v.id("posts"),
        userId: v.id("users"),
        content: v.string(),
    }).index("by_post", ["postId"]),

    likes: defineTable({
        postId: v.id("posts"),
        userId: v.id("users"),
    })
        .index("by_post", ["postId"])
        .index("by_user_post", ["userId", "postId"]),

    presence: defineTable({
        postId: v.id("posts"),
        userId: v.optional(v.id("users")),
        user: v.optional(v.string()), // "anon" for anonymous users
        updated: v.number(),
    })
        .index("by_post", ["postId"])
        .index("by_post_user", ["postId", "userId"])
        .index("by_post_updated", ["postId", "updated"]), // Added for efficient filtering

    saves: defineTable({
        postId: v.id("posts"),
        userId: v.id("users"),
    })
        .index("by_user", ["userId"])
        .index("by_user_post", ["userId", "postId"]),
    notifications: defineTable({
        recipientId: v.id("users"),
        senderId: v.id("users"),
        type: v.union(v.literal("like"), v.literal("comment")),
        postId: v.id("posts"),
        read: v.boolean(),
    })
        .index("by_recipient", ["recipientId"])
        .index("by_recipient_read", ["recipientId", "read"]),
});
