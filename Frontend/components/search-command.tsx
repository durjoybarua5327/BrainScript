"use client";

import * as React from "react";
import { FileText, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchCommand() {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const searchResults = useQuery(
        api.search.searchAll,
        searchQuery.length > 2 ? { query: searchQuery } : "skip"
    );

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-10 w-full justify-start text-sm text-muted-foreground bg-muted/50 border-0 hover:bg-muted/80 rounded-full px-4"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="inline-flex">Search articles...</span>
                <kbd className="pointer-events-none absolute right-3 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search posts and users..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {searchResults?.posts && searchResults.posts.length > 0 && (
                        <CommandGroup heading="Posts">
                            {searchResults.posts.map((post) => (
                                <CommandItem
                                    key={post._id}
                                    onSelect={() => {
                                        window.location.href = `/posts/${post.slug}`;
                                        setOpen(false);
                                    }}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{post.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {searchResults?.users && searchResults.users.length > 0 && (
                        <CommandGroup heading="Users">
                            {searchResults.users.map((user) => (
                                <CommandItem
                                    key={user._id}
                                    onSelect={() => {
                                        setOpen(false);
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>{user.name || user.email}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
