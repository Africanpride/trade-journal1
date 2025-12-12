import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TradeJournal</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/faqs">
              <Button variant="ghost">FAQs</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              Track Your Trades, <span className="text-primary">Master Your Strategy</span>
            </h1>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
              Professional trade journaling for serious traders. Automatically log trades, analyze patterns, and improve
              your decision-making with detailed performance insights.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-24 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Automated Logging</h3>
                <p className="text-sm text-muted-foreground">
                  Receive trades via API webhooks and log them automatically
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed statistics and performance metrics for every trade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Pattern Recognition</h3>
                <p className="text-sm text-muted-foreground">Track reasons and patterns to identify what works</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your trading data is encrypted and protected</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2025 TradeJournal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
