import { Metadata } from "next";
import PostPageClient from "@/components/post-page-client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await convex.query(api.posts.getBySlug, { slug });

    if (!post) {
        return {
            title: "Post Not Found | BrainScript",
        };
    }

    return {
        title: `${post.title} | BrainScript`,
        description: post.excerpt || "Read this post on BrainScript.",
    };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <PostPageClient slug={slug} />;
}
