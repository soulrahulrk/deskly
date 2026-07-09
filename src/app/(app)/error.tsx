"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4">
          <p className="text-sm opacity-90">
            An unexpected error occurred while loading this page.
          </p>
          <Button variant="outline" size="sm" onClick={() => reset()} className="w-fit">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
