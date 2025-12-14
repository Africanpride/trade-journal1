"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeyManager } from "@/components/api-key-manager"
import { ProfileForm } from "./profile-form"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings, API keys, and profile.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="apikey" className="py-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="apikey">API Key</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="apikey" className="mt-4">
                        <ApiKeyManager />
                    </TabsContent>
                    <TabsContent value="profile" className="mt-4">
                        <ProfileForm />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
