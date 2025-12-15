"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const updateTheme = useMutation(api.users.updateTheme)

    const toggleTheme = () => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark"
        setTheme(newTheme)
        // Persist theme choice, fire and forget
        updateTheme({ theme: newTheme }).catch((e) => console.error("Failed to save theme", e))
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
