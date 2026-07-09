"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token provided."
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!token) return;

    startTransition(async () => {
      const result = await verifyEmailAction({ token });
      if (result.ok) {
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
      } else {
        setStatus("error");
        setMessage(result.error);
      }
    });
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        {status === "loading" && (
          <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" />
        )}
        {status === "success" && (
          <CheckCircle2 className="mx-auto size-10 text-success" />
        )}
        {status === "error" && (
          <AlertCircle className="mx-auto size-10 text-destructive" />
        )}
        <CardTitle className="text-xl">
          {status === "loading" && "Verifying…"}
          {status === "success" && "Email verified"}
          {status === "error" && "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <p className="text-center text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button asChild variant="outline">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
