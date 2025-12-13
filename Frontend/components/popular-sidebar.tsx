"use client";

import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PopularSidebar() {
    return (
        <div className="space-y-8">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Popular Posts</h3>
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 items-start group cursor-pointer">
                            <span className="text-3xl font-bold text-muted-foreground/20 leading-none">
                                {i}
                            </span>
                            <div>
                                <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                    Building Scalable React Applications with Modern Architecture
                                </h4>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 4521</span>
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 312</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "JavaScript", "Node.js", "CSS", "AI", "Performance", "Accessibility"].map(tag => (
                        <Badge key={tag} variant="secondary" className="hover:bg-secondary/80 cursor-pointer px-3 py-1 font-normal">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-2">Subscribe to Newsletter</h3>
                <p className="text-white/80 text-sm mb-4">Get the latest articles delivered to your inbox</p>
                {/* Form placeholder */}
            </div>
        </div>
    );
}
