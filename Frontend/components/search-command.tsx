"use client";

import * as React from "react";
import { FileText, User, Search, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CommandInput as CommandPrimitiveInput } from "cmdk";
import { cn } from "@/lib/utils";

export function SearchCommand() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    // Only query if we have some text to save resources
    const searchResults = useQuery(
        api.search.searchAll,
        searchQuery.length > 0 ? { query: searchQuery } : "skip"
    );

    const handleSelect = (url: string) => {
        router.push(url);
        setSearchQuery("");
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".search-container")) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (!isSignedIn) {
        return (
            <div className="relative w-full search-container z-50">
                <SignInButton mode="modal">
                    <button className="flex h-10 w-full items-center gap-2 rounded-full border bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted text-left">
                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                        <span>Search posts and users...</span>
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div className="relative w-full search-container z-50">
            <Command
                shouldFilter={false}
                className="rounded-full border bg-muted/50 overflow-visible"
            >
                <div className="flex items-center px-4 w-full" cmdk-input-wrapper="">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandPrimitiveInput
                        placeholder="Search posts and users..."
                        value={searchQuery}
                        onValueChange={(val) => {
                            setSearchQuery(val);
                            setIsOpen(!!val);
                        }}
                        onFocus={() => {
                            if (searchQuery) setIsOpen(true);
                        }}
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 flex-1"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setIsOpen(false);
                            }}
                            className="ml-2 hover:bg-muted p-1 rounded-full shrink-0"
                        >
                            <X className="h-4 w-4 opacity-50" />
                        </button>
                    )}
                </div>

                {isOpen && searchQuery.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 rounded-xl border bg-popover text-popover-foreground shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden py-2">
                            {/* Show loading state or empty state */}
                            {!searchResults ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : (
                                <>
                                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                        No results found.
                                    </CommandEmpty>

                                    {searchResults.posts.length > 0 && (
                                        <CommandGroup heading="Posts" className="px-2">
                                            {searchResults.posts.map((post) => (
                                                <CommandItem
                                                    key={post._id}
                                                    value={`post-${post._id}`}
                                                    onSelect={() => handleSelect(`/posts/${post.slug}`)}
                                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                                                >
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span>{post.title}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {searchResults.users.length > 0 && (
                                        <CommandGroup heading="Users" className="px-2">
                                            {searchResults.users.map((user) => (
                                                <CommandItem
                                                    key={user._id}
                                                    value={`user-${user._id}`}
                                                    onSelect={() => handleSelect(`/profile/${user._id}`)} // Assuming profile routes use ID or handle it
                                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                                                >
                                                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span>{user.name || user.email}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    );
}
