"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UserManagementTable() {
    const users = useQuery(api.admin.getAllUsers);
    const updateRole = useMutation(api.admin.updateUserRole);
    const deleteUser = useMutation(api.admin.deleteUser);
    const { toast } = useToast();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{
        id: Id<"users">;
        name: string;
    } | null>(null);

    const handleRoleToggle = async (userId: Id<"users">, currentRole: string) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        try {
            await updateRole({ userId, newRole });
            toast({
                title: "Role updated",
                description: `User role changed to ${newRole}`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update role",
                variant: "destructive",
            });
        }
    };

    const handleDeleteClick = (userId: Id<"users">, userName: string) => {
        setUserToDelete({ id: userId, name: userName });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser({ userId: userToDelete.id });
            toast({
                title: "User deleted",
                description: `${userToDelete.name} has been removed`,
            });
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    if (!users) {
        return <div className="text-center py-8">Loading users...</div>;
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.name}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === "admin" ? "default" : "secondary"}
                                        className="gap-1"
                                    >
                                        {user.role === "admin" ? (
                                            <Shield className="w-3 h-3" />
                                        ) : (
                                            <User className="w-3 h-3" />
                                        )}
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(user._creationTime).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRoleToggle(user._id, user.role)}
                                    >
                                        {user.role === "admin" ? "Demote" : "Promote"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteClick(user._id, user.name || "User")}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {userToDelete?.name} and all their data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
