import { Link } from "wouter";
import { Search } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageTransition className="flex items-center justify-center pt-0">
      <div className="text-center max-w-md px-4 mt-20">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Looks like this page has wandered off the canvas. Let's get you back to the gallery.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white">
            Return Home
          </Button>
        </Link>
      </div>
    </PageTransition>
  );
}
