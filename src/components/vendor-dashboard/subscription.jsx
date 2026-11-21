"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Crown, Layers3, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createPremiumCheckoutSession,
  createSubscriptionPortalSession,
  fetchPaymentSubscription,
  fetchVendorOverview,
} from "@/lib/api";
import { FREE_ACTIVE_SERVICE_LIMIT } from "@/lib/vendor-plans";

function SubscriptionSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="min-h-52">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-8 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-36" />
        </CardContent>
      </Card>
      <Card className="min-h-52">
        <CardHeader>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-8 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorSubscription() {
  const [overview, setOverview] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [action, setAction] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchVendorOverview({ signal: controller.signal }),
      fetchPaymentSubscription({ signal: controller.signal }),
    ])
      .then(([overviewResult, subscriptionResult]) => {
        setOverview(overviewResult);
        setSubscription(subscriptionResult);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your subscription.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  const isPremium = subscription?.currentPlan === "premium";
  const activeServiceCount = overview?.activeServices ?? 0;
  const usagePercent = Math.min(
    100,
    (activeServiceCount / FREE_ACTIVE_SERVICE_LIMIT) * 100,
  );

  async function startCheckout() {
    setAction("checkout");
    try {
      const session = await createPremiumCheckoutSession();
      window.location.assign(session.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start Premium checkout.",
      );
      setAction("");
    }
  }

  async function openPortal() {
    setAction("portal");
    try {
      const session = await createSubscriptionPortalSession();
      window.location.assign(session.url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open subscription management.",
      );
      setAction("");
    }
  }

  return (
    <section className="space-y-7" aria-labelledby="vendor-subscription-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Vendor dashboard</p>
        <h1
          id="vendor-subscription-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          Subscription
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          View your current plan and how it affects your active services.
        </p>
      </header>

      {status === "loading" ? <SubscriptionSkeleton /> : null}

      {status === "success" && overview ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardDescription>Current plan</CardDescription>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {isPremium ? (
                      <Crown aria-hidden="true" className="size-5" />
                    ) : (
                      <Layers3 aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <CardTitle className="text-2xl">
                    {isPremium ? "Premium" : "Free"}
                  </CardTitle>
                </div>
                {isPremium ? (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-foreground">
                    <Crown aria-hidden="true" className="size-4" />
                    Premium Vendor
                  </span>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {isPremium
                    ? "Your active Premium plan removes the active-service cap."
                    : `Upgrade for $9/month and remove the ${FREE_ACTIVE_SERVICE_LIMIT}-service cap.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!isPremium ? (
                    <Button onClick={startCheckout} disabled={Boolean(action)}>
                      {action === "checkout" ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="animate-spin"
                        />
                      ) : (
                        <Crown aria-hidden="true" />
                      )}
                      Subscribe for $9/month
                    </Button>
                  ) : null}
                  {subscription?.canManageSubscription ? (
                    <Button
                      variant="outline"
                      onClick={openPortal}
                      disabled={Boolean(action)}
                    >
                      {action === "portal" ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="animate-spin"
                        />
                      ) : null}
                      Manage Subscription
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    render={<Link href="/dashboard/vendor/services" />}
                  >
                    Manage services
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
                {subscription?.subscriptionExpiresAt ? (
                  <p className="text-sm text-muted-foreground">
                    Current period ends{" "}
                    {new Date(subscription.subscriptionExpiresAt).toLocaleDateString()}.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardDescription>Active services</CardDescription>
                <CardTitle className="text-2xl">
                  {isPremium
                    ? `${activeServiceCount} active`
                    : `${activeServiceCount} / ${FREE_ACTIVE_SERVICE_LIMIT}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isPremium ? (
                  <p className="text-sm text-muted-foreground">
                    Premium currently has no active-service limit.
                  </p>
                ) : (
                  <>
                    <div
                      role="progressbar"
                      aria-label="Free plan active service usage"
                      aria-valuemin={0}
                      aria-valuemax={FREE_ACTIVE_SERVICE_LIMIT}
                      aria-valuenow={Math.min(
                        activeServiceCount,
                        FREE_ACTIVE_SERVICE_LIMIT,
                      )}
                      aria-valuetext={`${activeServiceCount} of ${FREE_ACTIVE_SERVICE_LIMIT} active services`}
                      className="h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {overview.totalServices} total services in your account.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div
            role="note"
            className="rounded-xl border border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground"
          >
            Stripe securely processes subscription payments. Your Premium status
            updates after Stripe confirms the payment.
          </div>
        </>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Subscription could not be loaded
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            className="mt-5"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </section>
  );
}
