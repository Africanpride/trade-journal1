"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Copy, RefreshCw, Check } from "lucide-react"
import { generateApiKey, getApiKey } from "@/app/actions/api-key"
import { toast } from "sonner"

export function ApiKeyManager() {
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [visible, setVisible] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadApiKey()
    }, [])

    async function loadApiKey() {
        try {
            const result = await getApiKey()
            if (result.apiKey) {
                setApiKey(result.apiKey)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load API key")
        } finally {
            setLoading(false)
        }
    }

    async function handleGenerate() {
        setGenerating(true)
        try {
            const result = await generateApiKey()
            if (result.success && result.apiKey) {
                setApiKey(result.apiKey)
                toast.success("New API key generated")
            } else {
                toast.error("Failed to generate API key")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setGenerating(false)
        }
    }

    const copyToClipboard = () => {
        if (!apiKey) return
        navigator.clipboard.writeText(apiKey)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return <div>Loading API Key settings...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                    Use this key to authenticate requests from your expert advisor.
                    Keep this key secret.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            type={visible ? "text" : "password"}
                            value={apiKey || ""}
                            readOnly
                            placeholder="No API Key generated yet"
                        />
                        {apiKey && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setVisible(!visible)}
                            >
                                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">Toggle visibility</span>
                            </Button>
                        )}

                    </div>
                    <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!apiKey}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            {apiKey ? "Regenerate Key" : "Generate Key"}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
