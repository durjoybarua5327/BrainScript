"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WriterCard } from "@/components/writer-card";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function TopWritersPage() {
    const { user } = useUser();
    const topWriters = useQuery(api.users.getTopWriters);
    const convexUser = useQuery(api.users.getMe);
    const myId = convexUser?._id;

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        Top Writers
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover the brilliant minds behind our most popular content.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {!topWriters ? (
                        // Loading placeholders
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-muted/10 w-full max-w-sm h-[300px] rounded-[32px] animate-pulse border border-border/50" />
                        ))
                    ) : (
                        topWriters.length > 0 ? (
                            topWriters.map((writer) => {
                                const isMe = myId === writer._id;
                                const href = isMe ? "/profile" : `/profile/${writer._id}`;

                                return (
                                    <Link key={writer._id} href={href} className="block w-full max-w-sm hover:no-underline">
                                        <WriterCard author={writer} />
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground">
                                No writers found. Be the first!
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    );
}
