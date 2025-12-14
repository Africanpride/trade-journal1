"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { UserWithProfile } from "@/app/actions/admin"
import { updateUserEmail, updateUserRole } from "@/app/actions/admin"
import { toast } from "sonner"

interface EditUserDialogProps {
    user: UserWithProfile
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState<"user" | "admin" | "superadmin">(user.profile?.role || "user")
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)

        try {
            // Update email if changed
            if (email !== user.email) {
                const emailResult = await updateUserEmail(user.id, email)
                if (emailResult.error) {
                    toast.error(emailResult.error)
                    setLoading(false)
                    return
                }
            }

            // Update role if changed
            if (role !== user.profile?.role) {
                const roleResult = await updateUserRole(user.id, role)
                if (roleResult.error) {
                    toast.error(roleResult.error)
                    setLoading(false)
                    return
                }
            }

            toast.success("User updated successfully")
            onOpenChange(false)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to update user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user email and role</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={loading}>
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
