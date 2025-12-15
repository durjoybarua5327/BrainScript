"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = useQuery(api.users.getMe);
    const router = useRouter();

    useEffect(() => {
        if (currentUser === null) {
            // User not logged in
            router.push("/");
        } else if (currentUser && currentUser.role !== "admin") {
            // User logged in but not admin
            router.push("/");
        }
    }, [currentUser, router]);

    // Show loading while checking auth
    if (currentUser === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render admin content if not admin
    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users and system settings</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">{children}</div>
        </div>
    );
}
