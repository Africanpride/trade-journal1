"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Footer } from "@/components/dashboard/footer"

interface User {
    id: string
    email: string
    role: string
    banned_at: string | null
    created_at: string
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string>("")

    useEffect(() => {
        // proxy.ts already handles admin route protection, so we just fetch users
        fetchCurrentUser()
        fetchUsers()
    }, [])

    async function fetchCurrentUser() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
            setUserEmail(user.email)
        }
    }

    async function fetchUsers() {
        try {
            const response = await fetch("/api/admin/users")
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            }
        } catch (error) {
            toast.error("Failed to fetch users")
        } finally {
            setLoading(false)
        }
    }

    async function handleBanToggle(userId: string, currentlyBanned: boolean) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ban: !currentlyBanned }),
            })

            if (response.ok) {
                toast.success(currentlyBanned ? "User unbanned" : "User banned")
                fetchUsers()
            } else {
                toast.error("Failed to update ban status")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    async function handleRoleChange(userId: string, newRole: string) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            })

            if (response.ok) {
                toast.success("Role updated successfully")
                fetchUsers()
            } else {
                toast.error("Failed to update role")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    async function handleDeleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("User deleted successfully")
                fetchUsers()
            } else {
                toast.error("Failed to delete user")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <DashboardHeader userEmail={userEmail} />
                <main className="flex-1 bg-muted/40 flex items-center justify-center">
                    <p>Loading...</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader userEmail={userEmail} />
            <main className="flex-1 bg-muted/40">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage users and their permissions
                        </p>
                    </div>

                    <div className="rounded-md border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.banned_at ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : (
                                                <Badge variant="outline">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    {user.role === "superadmin" ? (
                                                        <DropdownMenuItem disabled className="text-muted-foreground">
                                                            Superadmin is protected
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() => handleBanToggle(user.id, !!user.banned_at)}
                                                            >
                                                                {user.banned_at ? "Unban User" : "Ban User"}
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>

                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(user.id, "user")}
                                                                disabled={user.role === "user"}
                                                            >
                                                                Set as User
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(user.id, "admin")}
                                                                disabled={user.role === "admin"}
                                                            >
                                                                Set as Admin
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(user.id, "superadmin")}
                                                            >
                                                                Set as Superadmin
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-destructive"
                                                            >
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
