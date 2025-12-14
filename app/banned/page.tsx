"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Ban } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BannedPage() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <Ban className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">Account Suspended</h1>
            <p className="mb-8 text-muted-foreground">
                Your account has been suspended due to a violation of our terms of service.<br />
                Please contact support if you believe this is a mistake.
            </p>
            <Button onClick={handleSignOut} variant="outline">
                Sign Out
            </Button>
        </div>
    )
}
