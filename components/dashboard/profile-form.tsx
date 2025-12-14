"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfile, upsertProfile, type ProfileFormData } from "@/app/actions/profile"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ProfileForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        telephone: "",
        country: "",
    })

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        const result = await getProfile()

        if (result.error) {
            toast.error(result.error)
        } else if (result.profile) {
            setFormData({
                name: result.profile.name || "",
                telephone: result.profile.telephone || "",
                country: result.profile.country || "",
            })
        }

        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const result = await upsertProfile(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Profile saved successfully")
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Telephone</Label>
                            <Input
                                id="telephone"
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                disabled={saving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="United States"
                                disabled={saving}
                            />
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Profile"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
