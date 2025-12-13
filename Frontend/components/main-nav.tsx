"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search-command";

export function MainNav() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                {/* Left Side: Logo + Nav Links */}
                <div className="flex items-center gap-8">
                    {/* App Logo */}
                    <Link href="/" className="flex items-center gap-2 mr-6">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            B
                        </div>
                        <span className="text-xl font-bold tracking-tight">BrainScript</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/"
                            className={cn(
                                "transition-colors hover:text-primary",
                                pathname === "/" ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            Home
                        </Link>
                        <Link
                            href="/categories"
                            className={cn(
                                "transition-colors hover:text-primary",
                                pathname?.startsWith("/categories") ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            Categories
                        </Link>
                        <Link
                            href="/top-writers"
                            className={cn(
                                "transition-colors hover:text-primary",
                                pathname?.startsWith("/top-writers") ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            Top Writers
                        </Link>
                        <SignedIn>
                            <Link
                                href="/profile"
                                className={cn(
                                    "transition-colors hover:text-primary",
                                    pathname?.startsWith("/profile") ? "text-primary font-semibold" : "text-muted-foreground"
                                )}
                            >
                                Profile
                            </Link>
                        </SignedIn>
                    </nav>
                </div>

                {/* Middle: Search */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
                    <div className="w-full max-w-lg">
                        <SearchCommand />
                    </div>
                </div>

                {/* Right Side: Theme + Auth */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <SignedOut>
                        <div className="flex items-center gap-2">
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            userProfileMode="modal"
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
