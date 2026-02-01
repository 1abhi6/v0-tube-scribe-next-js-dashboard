"use client";

import { cn } from "@/lib/utils";
import type { GenerationStep } from "@/app/actions";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface ProgressStepperProps {
  currentStep: GenerationStep;
}

const steps: { key: GenerationStep; label: string }[] = [
  { key: "fetching", label: "Fetching Transcript" },
  { key: "summarizing", label: "AI Summarizing" },
  { key: "formatting", label: "Formatting Markdown" },
];

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  if (currentStep === "idle" || currentStep === "complete") {
    return null;
  }

  const getStepIndex = (step: GenerationStep) => {
    return steps.findIndex((s) => s.key === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isComplete = index < currentIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isComplete
                      ? "border-primary bg-primary"
                      : isActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 h-px flex-1 bg-border">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      isComplete ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
