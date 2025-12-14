"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { UserWithProfile } from "@/app/actions/admin"
import { deleteUser } from "@/app/actions/admin"
import { toast } from "sonner"

interface DeleteUserDialogProps {
    user: UserWithProfile
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)

        const result = await deleteUser(user.id)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success("User deleted successfully")
            onOpenChange(false)
            window.location.reload()
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account for{" "}
                        <span className="font-semibold">{user.email}</span> and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                        {loading ? "Deleting..." : "Delete User"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
