import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FAQsPage() {
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
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

      {/* FAQs Content */}
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight lg:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Everything you need to know about TradeJournal and MT5 integration
            </p>
          </div>

          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {/* Getting Started */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">What is TradeJournal and how does it work?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  TradeJournal is an automated trade logging system that receives trade data from your MT5 Expert
                  Advisor (EA) via API webhooks. Each trade is automatically recorded with entry/exit points, take
                  profit, stop loss, and your trading reasons, helping you analyze patterns and improve your strategy
                  over time.
                </AccordionContent>
              </AccordionItem>

              {/* API Key Generation */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">How do I generate an API key?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  After signing up and logging into your dashboard, navigate to Settings from the top navigation bar.
                  You'll find an "API Key" section where you can generate a new API key with one click. This key is
                  unique to your account and should be kept secure. Copy this key and paste it into your MT5 Expert
                  Advisor configuration.
                </AccordionContent>
              </AccordionItem>

              {/* MT5 Integration */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  How do I integrate with my MT5 Expert Advisor?
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>Generate your API key from the Settings page in your dashboard</li>
                    <li>Copy the generated API key</li>
                    <li>Open your MT5 platform and locate your Expert Advisor (EA) settings or input parameters</li>
                    <li>Paste your API key into the designated API key field in the EA</li>
                    <li>Configure the webhook URL (provided in Settings) if your EA requires it</li>
                    <li>
                      Enable the EA and it will automatically send trade data to TradeJournal when trades are executed
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* API Endpoint */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">What's the API endpoint for sending trades?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Your trades should be sent via POST request to{" "}
                  <code className="rounded bg-muted px-2 py-1">/api/trades</code>. The request must include your API key
                  in the Authorization header as <code className="rounded bg-muted px-2 py-1">Bearer YOUR_API_KEY</code>
                  . The payload should contain trade details including pair, timeframe, direction, entry, tp, sl, and
                  message with your trading reasons.
                </AccordionContent>
              </AccordionItem>

              {/* Data Format */}
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">What data format should my EA send?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Your EA should send JSON data with the following structure:
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    {`{
  "message": "BUY\\nReasons: Bullish Engulfing, Support Bounce",
  "pair": "EURUSD",
  "timeframe": "PERIOD_H1",
  "direction": "BUY",
  "entry": 1.08520,
  "tp": 1.09020,
  "sl": 1.08020
}`}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Security */}
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">Is my trading data secure?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Yes! Your trading data is protected with industry-standard security measures including encrypted
                  storage, Row Level Security (RLS) policies ensuring you can only access your own trades, and secure
                  API authentication. Your API key acts as a password and should never be shared publicly.
                </AccordionContent>
              </AccordionItem>

              {/* Regenerate API Key */}
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">Can I regenerate my API key?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Yes! You can regenerate your API key at any time from the Settings page. Keep in mind that
                  regenerating your key will invalidate the old one, so you'll need to update your MT5 EA with the new
                  key for trades to continue logging automatically.
                </AccordionContent>
              </AccordionItem>

              {/* View Trades */}
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">Where can I view my logged trades?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  All your trades are displayed in the Dashboard after logging in. You'll see comprehensive statistics
                  including total trades, profit/loss, win rate, and a detailed list of all your trades with their
                  entry/exit points, take profit, stop loss, and the reasons you recorded for each trade.
                </AccordionContent>
              </AccordionItem>

              {/* Edit/Delete Trades */}
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">Can I edit or delete trades?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Yes! Each trade in your dashboard has edit and delete options. You can update trade details, modify
                  your trading reasons, or remove trades that were logged incorrectly. All changes are saved immediately
                  to your trade journal.
                </AccordionContent>
              </AccordionItem>

              {/* Trading Reasons */}
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">Why should I record trading reasons?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  Recording your trading reasons is crucial for pattern recognition and strategy improvement. By
                  documenting why you entered each trade (e.g., "Bullish Engulfing", "Support Bounce"), you can later
                  analyze which setups have the highest success rate and refine your trading approach based on data
                  rather than emotion.
                </AccordionContent>
              </AccordionItem>

              {/* Pricing */}
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">Is TradeJournal free to use?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  TradeJournal offers a free trial to get started. You can log trades, access your dashboard, and
                  explore all features. Check our pricing page for details on premium plans with additional features
                  like advanced analytics, unlimited trade history, and priority support.
                </AccordionContent>
              </AccordionItem>

              {/* Support */}
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">How do I get help if I encounter issues?</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  If you need assistance, you can reach out through the contact form on our website, check our
                  documentation for detailed guides, or contact our support team directly. We're here to help you get
                  the most out of your trade journaling experience.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* CTA Section */}
          <div className="mt-12 rounded-lg bg-primary/5 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Ready to Start Journaling?</h2>
            <p className="mb-6 text-muted-foreground">
              Join traders who are improving their strategies with automated trade logging
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2025 TradeJournal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
