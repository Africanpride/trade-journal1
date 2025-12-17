export default function BannedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mx-auto max-w-md text-center">
                <h1 className="mb-4 text-4xl font-bold">Account Banned</h1>
                <p className="mb-8 text-muted-foreground">
                    Your account has been banned. Please contact support for more information.
                </p>
            </div>
        </div>
    )
}
