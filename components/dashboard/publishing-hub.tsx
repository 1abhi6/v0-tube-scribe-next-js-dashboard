"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Send,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { publishToHashnodeAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface PublishingHubProps {
  hasContent: boolean;
  markdownContent: string;
}

export function PublishingHub({ hasContent, markdownContent }: PublishingHubProps) {
  const { toast } = useToast();
  
  // Hashnode state
  const [hashnodeToken, setHashnodeToken] = useState("");
  const [hashnodePublicationId, setHashnodePublicationId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isHashnodeConnected, setIsHashnodeConnected] = useState(false);

  const handleHashnodePublish = async () => {
    if (!hashnodeToken || !hashnodePublicationId) {
      toast({
        variant: "destructive",
        title: "Missing credentials",
        description: "Please enter both your Hashnode token and Publication ID.",
      });
      return;
    }

    setIsPublishing(true);
    setPublishedUrl(null);

    try {
      const result = await publishToHashnodeAction(
        markdownContent,
        hashnodeToken,
        hashnodePublicationId
      );

      if (result.success && result.postUrl) {
        setPublishedUrl(result.postUrl);
        setIsHashnodeConnected(true);
        toast({
          title: "Published successfully!",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <a
                href={result.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                View your post on Hashnode
              </a>
            </div>
          ),
        });
      } else {
        // Check for invalid token error
        if (result.error?.toLowerCase().includes("invalid token")) {
          toast({
            variant: "destructive",
            title: "Invalid Token",
            description: "Your Hashnode Personal Access Token is invalid. Please check and try again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Publishing failed",
            description: result.error || "Failed to publish to Hashnode",
          });
        }
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while publishing.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Publishing Hub
          </h3>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Medium Card */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Medium
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Publish to your Medium account
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Hashnode Card */}
        <div
          className={cn(
            "rounded-lg border bg-secondary/30 p-4 transition-colors",
            publishedUrl
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:bg-secondary/50"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 110-7.906 3.953 3.953 0 010 7.906z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Hashnode
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      isHashnodeConnected || publishedUrl
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {publishedUrl ? "Published" : isHashnodeConnected ? "Connected" : "Setup Required"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Publish to your Hashnode blog
                </p>
              </div>
            </div>
          </div>

          {/* Success State */}
          {publishedUrl && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Successfully published!
                </p>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                >
                  <LinkIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{publishedUrl}</span>
                </a>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 bg-transparent"
                onClick={() => window.open(publishedUrl, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            </div>
          )}

          {/* Input Fields */}
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hashnode-token" className="text-xs text-muted-foreground">
                Personal Access Token
              </Label>
              <div className="relative">
                <Input
                  id="hashnode-token"
                  type={showToken ? "text" : "password"}
                  placeholder="Enter your Hashnode PAT"
                  value={hashnodeToken}
                  onChange={(e) => setHashnodeToken(e.target.value)}
                  className="pr-10 text-sm bg-background border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Get it from{" "}
                <a
                  href="https://hashnode.com/settings/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Hashnode Settings
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="publication-id" className="text-xs text-muted-foreground">
                Publication ID
              </Label>
              <Input
                id="publication-id"
                type="text"
                placeholder="e.g., 5f5678..."
                value={hashnodePublicationId}
                onChange={(e) => setHashnodePublicationId(e.target.value)}
                className="text-sm bg-background border-border"
              />
              <p className="text-xs text-muted-foreground/70">
                Found in your blog{"'"}s dashboard URL
              </p>
            </div>
          </div>

          {/* Publish Button */}
          <div className="mt-4">
            <Button
              size="sm"
              className="w-full gap-2"
              disabled={!hasContent || isPublishing || !hashnodeToken || !hashnodePublicationId}
              onClick={handleHashnodePublish}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing...
                </>
              ) : publishedUrl ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Publish Again
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Publish to Hashnode
                </>
              )}
            </Button>
          </div>

          {/* Warning for no content */}
          {!hasContent && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              Generate an article first to publish
            </div>
          )}
        </div>

        {/* Coming Soon */}
        <div className="rounded-lg border border-dashed border-border bg-secondary/10 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            More platforms coming soon
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Dev.to, Ghost, WordPress
          </p>
        </div>
      </div>
    </div>
  );
}
