import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    }).index("by_email", ["email"]),

    posts: defineTable({
        title: v.string(),
        slug: v.string(),
        content: v.string(), // HTML content
        coverImageId: v.optional(v.id("_storage")),
        authorId: v.id("users"),
        published: v.boolean(),
        excerpt: v.optional(v.string()),
        views: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_author", ["authorId"]),

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
        user: v.string(), // userID or sessionID
        updated: v.number(),
    })
        .index("by_post", ["postId"])
        .index("by_post_user", ["postId", "user"]),

    saves: defineTable({
        postId: v.id("posts"),
        userId: v.id("users"),
    })
        .index("by_user", ["userId"])
        .index("by_user_post", ["userId", "postId"]),
});
