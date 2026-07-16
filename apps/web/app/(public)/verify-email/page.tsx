"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/animations";
import { authService } from "@/services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
      } catch (error: unknown) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Verification failed");
      }
    };

    verify();
  }, [token]);

  return (
    <PageTransition>
      <div className="min-h-[90vh] flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm mx-auto text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Verifying your email</h1>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Your email has been successfully verified.
              </p>
              <Link href="/login">
                <Button className="w-full">Continue to Sign In</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
              <p className="text-sm text-muted-foreground mb-2">{errorMessage}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Please try again or contact support.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Back to Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}