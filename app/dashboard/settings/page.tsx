import { ApiKeyManager } from "@/components/api-key-manager"

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and API keys.
                </p>
            </div>

            <div className="grid gap-6">
                <ApiKeyManager />
            </div>
        </div>
    )
}
