"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, X } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { Trade } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    reasons: z.string().optional(),
    screenshot_url: z.string().optional(),
})

interface EditTradeDialogProps {
    trade: Trade
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTradeDialog({ trade, open, onOpenChange }: EditTradeDialogProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reasons: trade.reasons || "",
            screenshot_url: trade.screenshot_url || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/trades/${trade.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to update trade")
            }

            toast.success("Trade updated successfully")
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Trade</DialogTitle>
                    <DialogDescription>
                        Update your trade analysis and attach a screenshot.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="reasons"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reasons / Analysis</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Why did you take this trade?"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="screenshot_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Screenshot</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            <Input type="hidden" {...field} />

                                            {field.value ? (
                                                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={field.value}
                                                        alt="Trade screenshot"
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-8 w-8"
                                                        onClick={() => field.onChange("")}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <CldUploadWidget
                                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                                    onSuccess={(result: any) => {
                                                        if (result.info?.secure_url) {
                                                            field.onChange(result.info.secure_url)
                                                        }
                                                    }}
                                                >
                                                    {({ open }) => (
                                                        <div
                                                            onClick={() => open()}
                                                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 hover:bg-muted/50"
                                                        >
                                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">
                                                                Click to upload screenshot
                                                            </p>
                                                        </div>
                                                    )}
                                                </CldUploadWidget>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
