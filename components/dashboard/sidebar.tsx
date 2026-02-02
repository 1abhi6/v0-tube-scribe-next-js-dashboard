"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  Plug,
  Settings,
  Youtube,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: History, label: "History", href: "/history" },
  { icon: Plug, label: "Integrations", href: "/integrations" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const displayEmail = user?.email || "user@example.com";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Youtube className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          TubeScribe
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usage Stats */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-secondary/50 p-4">
          <p className="text-xs text-muted-foreground">Free Plan</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            3 / 10 articles
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full w-[30%] rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
