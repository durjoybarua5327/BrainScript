import { mutation } from "./_generated/server";

export const seed = mutation({
    handler: async (ctx) => {
        // Check if data already exists
        const existingUsers = await ctx.db.query("users").collect();
        if (existingUsers.length > 0) {
            console.log("Database already seeded");
            return;
        }

        // Create a demo user
        const userId = await ctx.db.insert("users", {
            name: "Demo User",
            email: "demo@example.com",
            image: "https://github.com/shadcn.png",
            role: "admin",
        });

        // Create some sample posts
        const posts = [
            {
                title: "Getting Started with BrainScript",
                slug: "getting-started-with-brainscript",
                content: `
          <h2>Welcome to BrainScript</h2>
          <p>This is a sample post to get you started. BrainScript is a powerful blog platform.</p>
          <pre><code>console.log("Hello, World!");</code></pre>
          <p>You can edit this post or create new ones!</p>
        `,
                excerpt: "Learn the basics of using BrainScript for your blog.",
                published: true,
                views: 120,
                authorId: userId,
            },
            {
                title: "The Future of Web Development",
                slug: "future-of-web-development",
                content: `
          <h2>Web Development in 2025</h2>
          <p>react server components, AI integration, and edge computing are changing the landscape.</p>
        `,
                excerpt: "Predictions for the next generation of web technologies.",
                published: true,
                views: 85,
                authorId: userId,
            },
            {
                title: "Advanced TypeScript Tips",
                slug: "advanced-typescript-tips",
                content: `
          <h2>Mastering Generics</h2>
          <p>Generics allow you to write reusable, type-safe code.</p>
        `,
                excerpt: "Level up your TypeScript skills with these advanced patterns.",
                published: true,
                views: 234,
                authorId: userId,
            },
        ];

        for (const post of posts) {
            await ctx.db.insert("posts", post);
        }

        console.log(`Seeded ${posts.length} posts and 1 user`);
    },
});
