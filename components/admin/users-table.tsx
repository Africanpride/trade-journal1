"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Ban, Shield, Trash2, Edit, CheckCircle } from "lucide-react"
import type { UserWithProfile } from "@/app/actions/admin"
import { useState } from "react"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { banUser, unbanUser, updateUserRole } from "@/app/actions/admin"
import { toast } from "sonner"
import { format } from "date-fns"

interface UsersTableProps {
    users: UserWithProfile[]
}

export function UsersTable({ users }: UsersTableProps) {
    const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null)

    const handleBanToggle = async (user: UserWithProfile) => {
        const action = user.profile?.banned_at ? unbanUser : banUser
        const result = await action(user.id)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(user.profile?.banned_at ? "User unbanned" : "User banned")
            window.location.reload() // Refresh to show updated data
        }
    }

    const handleRoleToggle = async (user: UserWithProfile) => {
        const currentRole = user.profile?.role || "user"
        const newRole = currentRole === "admin" ? "user" : "admin"

        const result = await updateUserRole(user.id, newRole)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Role updated to ${newRole}`)
            window.location.reload()
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.profile?.role === "superadmin"
                                                    ? "default"
                                                    : user.profile?.role === "admin"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                        >
                                            {user.profile?.role || "user"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
                                    <TableCell>
                                        {user.profile?.banned_at ? (
                                            <Badge variant="destructive">Banned</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-green-500 text-green-500">
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleBanToggle(user)}>
                                                    {user.profile?.banned_at ? (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Unban User
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Ban User
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                {user.profile?.role !== "superadmin" && (
                                                    <DropdownMenuItem onClick={() => handleRoleToggle(user)}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        {user.profile?.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingUser(user)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingUser && (
                <EditUserDialog user={editingUser} open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)} />
            )}

            {deletingUser && (
                <DeleteUserDialog
                    user={deletingUser}
                    open={!!deletingUser}
                    onOpenChange={(open) => !open && setDeletingUser(null)}
                />
            )}
        </>
    )
}
