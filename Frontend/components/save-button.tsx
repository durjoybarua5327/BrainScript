"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveButton({ postId }: { postId: Id<"posts"> }) {
    const hasSaved = useQuery(api.saves.hasSaved, { postId });
    const toggleSave = useMutation(api.saves.toggle);

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1", hasSaved && "text-blue-600")}
            onClick={() => toggleSave({ postId })}
        >
            <Bookmark className={cn("h-4 w-4", hasSaved && "fill-current")} />
            <span className="hidden sm:inline">{hasSaved ? "Saved" : "Save"}</span>
        </Button>
    );
}
