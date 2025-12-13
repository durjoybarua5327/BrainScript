"use client";

import { WriterCard } from "@/components/writer-card";

const topWriters = [
    {
        _id: "1",
        name: "Sarah Chen",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        bio: "Full-stack developer and tech writer. Passionate about React, Node.js, and cloud architecture.",
        stats: { posts: 24, followers: 1542 }
    },
    {
        _id: "2",
        name: "Marcus Rodriguez",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
        bio: "AI/ML engineer exploring the intersection of technology and creativity.",
        stats: { posts: 18, followers: 2103 }
    },
    {
        _id: "3",
        name: "Emily Watson",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        bio: "UX designer and frontend specialist. Crafting beautiful user experiences.",
        stats: { posts: 31, followers: 3241 }
    },
    {
        _id: "4",
        name: "David Kim",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        bio: "Cloud architect and DevOps enthusiast. Sharing insights on scaling systems.",
        stats: { posts: 42, followers: 1890 }
    },
    {
        _id: "5",
        name: "Lisa Patel",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        bio: "Cybersecurity expert breaking down complex security concepts for everyone.",
        stats: { posts: 15, followers: 1200 }
    },
    {
        _id: "6",
        name: "James Wilson",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        bio: "Data scientist turning raw data into compelling stories and insights.",
        stats: { posts: 27, followers: 2450 }
    }
];

export default function TopWritersPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Top Writers
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover the brilliant minds behind our most popular content. Follow them to stay updated with their latest insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {topWriters.map((writer) => (
                        <WriterCard key={writer._id} author={writer} />
                    ))}
                </div>
            </div>
        </main>
    );
}
