// app/admin/page.tsx
import { redirect } from "next/navigation"
import { isSuperadmin } from "@/app/actions/isAdmin"
import { getAllUsers } from "@/app/actions/admin"
import { UsersTable } from "@/components/admin/users-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function AdminPage() {
    const superadmin = await isSuperadmin()

    if (!superadmin) {
        redirect("/dashboard")
    }

    const { users, error } = await getAllUsers()

    if (error || !users) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Error</h1>
                    <p className="text-muted-foreground">{error || "Failed to load users"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <Link href="/dashboard">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 bg-muted/40">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold">User Management</h2>
                        <p className="text-muted-foreground">Manage all user accounts and permissions</p>
                    </div>

                    <UsersTable users={users} />
                </div>
            </main>
        </div>
    )
}
