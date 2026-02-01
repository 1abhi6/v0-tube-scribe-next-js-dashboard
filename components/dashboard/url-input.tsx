"use client";

import React from "react"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Sparkles } from "lucide-react";
import { useState } from "react";

interface UrlInputProps {
  onGenerate: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onGenerate, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onGenerate(url.trim());
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Convert YouTube to Article
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a YouTube URL to generate a well-formatted article from the video content
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Link className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 bg-input pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:shadow-[0_0_20px_rgba(94,234,212,0.3)]"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="h-12 gap-2 px-6 font-medium shadow-[0_0_20px_rgba(94,234,212,0.2)] transition-all hover:shadow-[0_0_30px_rgba(94,234,212,0.4)]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Article
        </Button>
      </form>
    </div>
  );
}
