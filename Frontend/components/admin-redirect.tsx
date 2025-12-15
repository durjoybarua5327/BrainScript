"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AdminRedirect() {
    const currentUser = useQuery(api.users.getMe);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only redirect if user is loaded, is an admin, and not already on admin page
        if (currentUser && currentUser.role === "admin" && !pathname.startsWith("/admin")) {
            router.push("/admin");
        }
    }, [currentUser, router, pathname]);

    return null;
}
