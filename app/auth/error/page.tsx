import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Youtube } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Youtube className="h-6 w-6 text-primary-foreground" />
        </div>
        
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong during the authentication process. Please try again.
        </p>
        
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/sign-in">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="border-border bg-transparent">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
