"use client";
import { ReactNode, useEffect } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <AuthDebug />
            {children}
        </ConvexProviderWithClerk>
    );
}

function AuthDebug() {
    const { getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (isSignedIn) {
            getToken({ template: "convex" }).then(token => {
                if (token) {
                    console.log("✅ Clerk Token for Convex successfully retrieved:", token.substring(0, 15) + "...");
                } else {
                    console.error("❌ Failed to retrieve Clerk Token. Please create a JWT template named 'convex' in Clerk Dashboard.");
                }
            }).catch(err => console.error("❌ Error fetching token:", err));
        }
    }, [isSignedIn, getToken]);
    return null;
}
