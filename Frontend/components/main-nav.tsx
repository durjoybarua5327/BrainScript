"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search-command";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationsMenu } from "@/components/notifications-menu";

export function MainNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const NavContent = () => (
        <>
            <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                    "transition-colors hover:text-primary py-2",
                    pathname === "/" ? "text-primary font-semibold" : "text-muted-foreground"
                )}
            >
                Home
            </Link>
            <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className={cn(
                    "transition-colors hover:text-primary py-2",
                    pathname?.startsWith("/categories") ? "text-primary font-semibold" : "text-muted-foreground"
                )}
            >
                Categories
            </Link>
            <Link
                href="/top-writers"
                onClick={() => setIsOpen(false)}
                className={cn(
                    "transition-colors hover:text-primary py-2",
                    pathname?.startsWith("/top-writers") ? "text-primary font-semibold" : "text-muted-foreground"
                )}
            >
                Top Writers
            </Link>
            <SignedIn>
                <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                        "transition-colors hover:text-primary py-2",
                        pathname?.startsWith("/profile") ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                >
                    Profile
                </Link>
            </SignedIn>
        </>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 px-4">
                {/* Mobile Menu Trigger & Logo */}
                <div className="flex items-center gap-2 md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] flex flex-col gap-8 z-[100]">
                            <SheetHeader>
                                <SheetTitle asChild>
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                        <Image
                                            src="/logo1.png"
                                            alt="BrainScript Logo"
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 object-contain dark:invert"
                                        />
                                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">BrainScript</span>
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 text-lg font-medium pl-6">
                                <NavContent />
                            </nav>
                            <div className="mt-auto border-t pt-6">
                                <SignedOut>
                                    <div className="flex flex-col gap-4">
                                        <SignInButton mode="modal">
                                            <Button variant="outline" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                                                Login
                                            </Button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsOpen(false)}>
                                                Sign Up
                                            </Button>
                                        </SignUpButton>
                                    </div>
                                </SignedOut>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo1.png"
                            alt="BrainScript Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain dark:invert"
                        />
                    </Link>
                </div>

                {/* Desktop Logo */}
                <Link href="/" className="hidden md:flex items-center gap-2 mr-6 shrink-0">
                    <Image
                        src="/logo1.png"
                        alt="BrainScript Logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain dark:invert"
                    />
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">BrainScript</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-6 text-md font-medium">
                    <NavContent />
                </nav>

                {/* Middle: Search (Responsive) */}
                <div className="flex-1 flex justify-end md:justify-center max-w-full">
                    <div className="w-full max-w-[200px] sm:max-w-md md:max-w-lg transition-all">
                        <SearchCommand />
                    </div>
                </div>

                {/* Right Side: Theme + Auth (Desktop) */}
                <div className="hidden md:flex items-center gap-4 shrink-0 justify-end">
                    <ThemeToggle />

                    <SignedOut>
                        <div className="flex items-center gap-2">
                            <SignInButton mode="modal">
                                <Button variant="ghost">
                                    Login
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <NotificationsMenu />
                        <UserButton
                            afterSignOutUrl="/"
                            userProfileMode="modal"
                            appearance={{
                                elements: {
                                    avatarBox: "h-10 w-10"
                                }
                            }}
                        />
                    </SignedIn>
                </div>

                {/* Mobile User Button (Always visible if signed in) */}
                <div className="flex md:hidden items-center gap-2 shrink-0">
                    <SignedIn>
                        <NotificationsMenu />
                        <UserButton
                            afterSignOutUrl="/"
                            userProfileMode="modal"
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
