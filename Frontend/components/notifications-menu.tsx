"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function NotificationsMenu() {
    const notifications = useQuery(api.notifications.get);
    const unreadCount = useQuery(api.notifications.getUnreadCount);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const deleteNotification = useMutation(api.notifications.deleteNotification);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = async (n: any) => {
        if (!n.read) {
            await markAsRead({ notificationId: n._id });
        }
        setIsOpen(false);
        if (n.postId) {
            router.push(`/posts/${n.postSlug || n.postId}`);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: Id<"notifications">) => {
        e.stopPropagation();
        await deleteNotification({ notificationId: id });
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-6 w-6" />
                    {(unreadCount || 0) > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse border border-background" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {(unreadCount || 0) > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-muted-foreground hover:text-primary"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications === undefined ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`relative flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!n.read ? "bg-muted/30" : ""
                                        }`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <Avatar className="h-9 w-9 border shrink-0">
                                        <AvatarImage src={n.senderImage} />
                                        <AvatarFallback>{n.senderName?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm leading-none">
                                            <span className="font-medium">{n.senderName}</span>{" "}
                                            <span className="text-muted-foreground">
                                                {n.type === "like" ? "liked your article" : "commented on"}
                                            </span>
                                        </p>
                                        <p className="text-sm font-medium text-foreground line-clamp-1">
                                            {n.postTitle}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(n._creationTime, { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        {!n.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mb-2" />
                                        )}
                                        {n.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDelete(e, n._id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
