"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, FileText } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Article Preview
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!content}
          className="gap-2 bg-transparent"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {content ? (
          <article className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-secondary p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No article generated yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Paste a YouTube URL above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
