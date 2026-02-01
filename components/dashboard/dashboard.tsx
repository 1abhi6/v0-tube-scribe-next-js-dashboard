"use client";

import { useState, useEffect } from "react";
import { UrlInput } from "./url-input";
import { ProgressStepper } from "./progress-stepper";
import { MarkdownEditor } from "./markdown-editor";
import { PublishingHub } from "./publishing-hub";
import { generateArticleAction, type GenerationStep } from "@/app/actions";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>("idle");
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Simulate step progression
      const steps: GenerationStep[] = ["fetching", "summarizing", "formatting"];
      let stepIndex = 0;

      setCurrentStep(steps[0]);

      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleGenerate = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setMarkdown("");

    try {
      const result = await generateArticleAction(url);

      if (result.success) {
        setMarkdown(result.markdown);
        setCurrentStep("complete");
      } else {
        setError(result.error || "Failed to generate article");
        setCurrentStep("idle");
      }
    } catch {
      setError("An unexpected error occurred");
      setCurrentStep("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setMarkdown(newContent);
  };

  return (
    <div className="ml-64 min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Transform YouTube videos into polished articles
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* URL Input Section */}
          <UrlInput onGenerate={handleGenerate} isLoading={isLoading} />

          {/* Progress Stepper */}
          {isLoading && <ProgressStepper currentStep={currentStep} />}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Two-Pane Layout */}
          <div className="grid min-h-[600px] gap-6 lg:grid-cols-5">
            {/* Left Pane - Markdown Editor (3 columns) */}
            <div className="lg:col-span-3">
              <MarkdownEditor content={markdown} onChange={handleContentChange} />
            </div>

            {/* Right Pane - Publishing Hub (2 columns) */}
            <div className="lg:col-span-2">
              <PublishingHub hasContent={!!markdown} markdownContent={markdown} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
