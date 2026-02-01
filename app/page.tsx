"use client";

import { Button } from "@/components/ui/button";
import { 
  Youtube, 
  FileText, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Globe
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Youtube,
    title: "Paste Any YouTube URL",
    description: "Simply paste a YouTube video link and let our AI do the rest.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Conversion",
    description: "Advanced AI extracts key insights and structures them perfectly.",
  },
  {
    icon: FileText,
    title: "Rich Markdown Output",
    description: "Get beautifully formatted articles ready for your blog.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Transcripts in any language are translated to English.",
  },
];

const benefits = [
  "Convert videos to articles in seconds",
  "Edit with built-in rich text editor",
  "Export to Medium & Hashnode",
  "No credit card required",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Youtube className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">TubeScribe</span>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Powered by GPT-4.1
          </div>
          
          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Transform YouTube Videos into
            <span className="text-primary"> Polished Articles</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            TubeScribe uses advanced AI to convert any YouTube video into a well-structured, 
            publication-ready blog article in seconds. No more manual transcription.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                Start Converting for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-sm text-muted-foreground">TubeScribe Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-6">
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    <Youtube className="h-5 w-5 text-primary" />
                    <div className="flex-1 rounded bg-background/50 px-3 py-2 text-left text-sm text-muted-foreground">
                      https://youtube.com/watch?v=...
                    </div>
                    <div className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                      Generate
                    </div>
                  </div>
                  <div className="h-48 rounded-lg border border-border bg-secondary/20 p-4">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-foreground/10" />
                      <div className="h-3 w-full rounded bg-muted-foreground/10" />
                      <div className="h-3 w-5/6 rounded bg-muted-foreground/10" />
                      <div className="h-3 w-4/5 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <div className="mb-3 text-xs text-muted-foreground">Publishing Hub</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded bg-background/30 px-3 py-2">
                        <div className="h-4 w-4 rounded bg-foreground/20" />
                        <span className="text-xs text-muted-foreground">Medium</span>
                      </div>
                      <div className="flex items-center gap-2 rounded bg-background/30 px-3 py-2">
                        <div className="h-4 w-4 rounded bg-foreground/20" />
                        <span className="text-xs text-muted-foreground">Hashnode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-secondary/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Four simple steps to transform any video into content
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Everything You Need to Create Content Faster
              </h2>
              <p className="mt-4 text-muted-foreground">
                Stop wasting hours transcribing and formatting. TubeScribe handles everything 
                so you can focus on what matters most.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-foreground">5 min</div>
                    <div className="text-sm text-muted-foreground">Average time saved per article</div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">10K+</div>
                    <div className="text-xs text-muted-foreground">Articles Generated</div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">2K+</div>
                    <div className="text-xs text-muted-foreground">Happy Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-secondary/20 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Transform Your Content Workflow?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of creators who save hours every week with TubeScribe.
          </p>
          <div className="mt-10">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                Create Your Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Youtube className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">TubeScribe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js & OpenAI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
