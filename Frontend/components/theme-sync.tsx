"use client";

import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export function ThemeSync() {
    const { setTheme, theme } = useTheme();
    const user = useQuery(api.users.getMe);
    const hasSynced = useRef(false);

    useEffect(() => {
        // Only sync once when user data is available to prevent overwriting local changes (blinking)
        // This handles "initial load" preference application without causing race conditions
        if (!hasSynced.current && user && user.theme) {
            setTheme(user.theme);
            hasSynced.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, setTheme]);

    return null;
}
