"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ApiKeyManager } from "@/components/api-key-manager"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [journallingEnabled, setJournallingEnabled] = useState(true)
    const [telegramEnabled, setTelegramEnabled] = useState(true)
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchPreferences()
        }
    }, [open])

    async function fetchPreferences() {
        try {
            setLoading(true)

            // Fetch preferences (which also returns the role)
            const response = await fetch('/api/preferences')

            if (response.ok) {
                const data = await response.json()
                setJournallingEnabled(data.enable_journalling ?? true)
                setTelegramEnabled(data.enable_telegram_notifications ?? true)
                // Role is fetched separately via admin API
            }

            // Fetch user role via dedicated endpoint that bypasses RLS
            const roleResponse = await fetch('/api/user/role')
            if (roleResponse.ok) {
                const roleData = await roleResponse.json()
                setUserRole(roleData.role || null)
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error)
            toast.error('Failed to load preferences')
        } finally {
            setLoading(false)
        }
    }

    async function updatePreference(preference: 'journalling' | 'telegram', value: boolean) {
        // Store previous values for rollback on error
        const prevJournalling = journallingEnabled
        const prevTelegram = telegramEnabled

        // Optimistically update UI immediately
        if (preference === 'journalling') {
            setJournallingEnabled(value)
        } else {
            setTelegramEnabled(value)
        }

        // Show saving toast
        const toastId = toast.loading('Saving...')

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enable_journalling: preference === 'journalling' ? value : journallingEnabled,
                    enable_telegram_notifications: preference === 'telegram' ? value : telegramEnabled,
                }),
            })

            if (response.ok) {
                if (preference === 'journalling') {
                    toast.success(value ? 'Trade journalling enabled' : 'Trade journalling disabled', { id: toastId })
                } else {
                    toast.success(value ? 'Telegram notifications enabled' : 'Telegram notifications disabled', { id: toastId })
                }
            } else {
                // Rollback on error
                setJournallingEnabled(prevJournalling)
                setTelegramEnabled(prevTelegram)
                toast.error('Failed to update preference', { id: toastId })
            }
        } catch (error) {
            // Rollback on error
            setJournallingEnabled(prevJournalling)
            setTelegramEnabled(prevTelegram)
            console.error('Failed to update preference:', error)
            toast.error('Failed to update preference', { id: toastId })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings and preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Preferences Section - Only for superadmin and admin */}
                    {(userRole === 'superadmin' || userRole === 'admin') && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Preferences</h3>

                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="journalling-toggle" className="text-base cursor-pointer">
                                        Trade Journalling
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically log trades to your journal
                                    </p>
                                </div>
                                <Switch
                                    id="journalling-toggle"
                                    checked={journallingEnabled}
                                    onCheckedChange={(value) => updatePreference('journalling', value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="telegram-toggle" className="text-base cursor-pointer">
                                        Telegram Notifications
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send trading signals to Telegram
                                    </p>
                                </div>
                                <Switch
                                    id="telegram-toggle"
                                    checked={telegramEnabled}
                                    onCheckedChange={(value) => updatePreference('telegram', value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {/* API Key Manager Section */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-medium">API Keys</h3>
                        <ApiKeyManager />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
