"use client";

import { Button } from "@/components/ui/button";
import {
  Bold,
  Check,
  Code,
  Copy,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pencil,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

type ViewMode = "preview" | "edit" | "split";

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateContent = useCallback(
    (newContent: string) => {
      onChange(newContent);
      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [onChange, history, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    updateContent(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: "Bold", action: () => insertFormatting("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertFormatting("*", "*") },
    { icon: Heading1, label: "Heading 1", action: () => insertFormatting("\n# ") },
    { icon: Heading2, label: "Heading 2", action: () => insertFormatting("\n## ") },
    { icon: Heading3, label: "Heading 3", action: () => insertFormatting("\n### ") },
    { icon: List, label: "Bullet List", action: () => insertFormatting("\n- ") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertFormatting("\n1. ") },
    { icon: Quote, label: "Quote", action: () => insertFormatting("\n> ") },
    { icon: Code, label: "Code", action: () => insertFormatting("`", "`") },
    { icon: Link, label: "Link", action: () => insertFormatting("[", "](url)") },
  ];

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-24 rounded bg-secondary animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-32 rounded bg-secondary animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-5">
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-full rounded bg-secondary animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Article Editor
          </h3>
          {content && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {wordCount} words · {readingTime} min read
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("edit")}
              className={`h-7 gap-1.5 rounded-md px-2.5 text-xs ${
                viewMode === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("split")}
              className={`h-7 gap-1.5 rounded-md px-2.5 text-xs ${
                viewMode === "split"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Split
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("preview")}
              className={`h-7 gap-1.5 rounded-md px-2.5 text-xs ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
          </div>

          <div className="h-5 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
            className="h-8 gap-2 bg-transparent text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Toolbar - Only show in edit or split mode */}
      {(viewMode === "edit" || viewMode === "split") && content && (
        <div className="flex items-center gap-1 border-b border-border bg-secondary/30 px-4 py-2">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Undo className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Undo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Redo className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Redo</TooltipContent>
              </Tooltip>
            </div>

            <div className="mx-2 h-5 w-px bg-border" />

            <div className="flex items-center gap-0.5">
              {toolbarButtons.map((button) => (
                <Tooltip key={button.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={button.action}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <button.icon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{button.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={`flex flex-col ${
              viewMode === "split" ? "w-1/2 border-r border-border" : "w-full"
            }`}
          >
            {content ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                className="h-full w-full resize-none bg-transparent p-5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="Start writing your article..."
                spellCheck={false}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-5 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <Pencil className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  No article to edit yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Generate an article first, then edit it here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`overflow-auto ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            {content ? (
              <article className="markdown-content p-5">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-5 text-center">
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
        )}
      </div>
    </div>
  );
}
