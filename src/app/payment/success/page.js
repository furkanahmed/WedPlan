"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPaymentSubscription } from "@/lib/api";

const maxAttempts = 10;
const pollIntervalMs = 3000;

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    let cancelled = false;
    const deadline = setTimeout(() => {
      if (cancelled) return;
      setStatus("pending");
      controller.abort();
    }, maxAttempts * pollIntervalMs);

    async function checkSubscription(attempt = 0) {
      try {
        const subscription = await fetchPaymentSubscription({
          signal: controller.signal,
        });
        if (cancelled) return;

        if (subscription.currentPlan === "premium") {
          clearTimeout(deadline);
          setStatus("active");
          return;
        }
        if (attempt + 1 >= maxAttempts) {
          clearTimeout(deadline);
          setStatus("pending");
          return;
        }

        timer = setTimeout(
          () => checkSubscription(attempt + 1),
          pollIntervalMs,
        );
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;
        clearTimeout(deadline);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm your subscription.",
        );
        setStatus("error");
      }
    }

    checkSubscription();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      clearTimeout(deadline);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full border-border">
        <CardHeader className="items-center text-center">
          {status === "active" ? (
            <CheckCircle2 aria-hidden="true" className="size-12 text-primary" />
          ) : (
            <Clock3 aria-hidden="true" className="size-12 text-primary" />
          )}
          <CardTitle className="font-heading text-2xl">
            {status === "active"
              ? "Premium is active"
              : status === "pending"
                ? "Payment confirmation is taking longer"
                : status === "error"
                  ? "We could not confirm your subscription"
                  : "Confirming your payment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {status === "active"
              ? "Stripe has confirmed your subscription. Your Premium benefits are ready."
              : status === "pending"
                ? "Your payment may still be processing. Check your subscription page shortly."
                : status === "error"
                  ? errorMessage
                  : "We are waiting for Stripe to confirm your subscription. This page will not activate Premium by itself."}
          </p>
          <Button render={<Link href="/dashboard/vendor/subscription" />}>
            View subscription
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
