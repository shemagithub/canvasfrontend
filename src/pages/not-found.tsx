import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center surface-page">
      <Card className="w-full max-w-md mx-4 surface-panel border-theme">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-theme">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-theme-muted">
            The page you are looking for does not exist or has been moved.
          </p>

          <Link href="/">
            <Button className="mt-6 w-full bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-wider">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
