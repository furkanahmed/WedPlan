"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Clock3,
  Crown,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchVendorOverview } from "@/lib/api";

const overviewCards = [
  {
    key: "totalServices",
    label: "Total services",
    description: "All services listed by your business",
    icon: Layers3,
  },
  {
    key: "activeServices",
    label: "Active services",
    description: "Services currently marked as available",
    icon: BriefcaseBusiness,
  },
  {
    key: "pendingRequests",
    label: "Pending requests",
    description: "Booking requests waiting for your response",
    icon: Clock3,
  },
  {
    key: "acceptedBookings",
    label: "Accepted bookings",
    description: "Requests you have accepted",
    icon: CalendarCheck,
  },
  {
    key: "currentPlan",
    label: "Current plan",
    description: "Your vendor subscription plan",
    icon: Crown,
  },
];

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {overviewCards.map(({ key }) => (
        <Card key={key} className="min-h-40">
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-8 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-48 max-w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorOverview() {
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchVendorOverview({ signal: controller.signal })
      .then((result) => {
        setOverview(result);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load the vendor dashboard.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="space-y-7" aria-labelledby="vendor-overview-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Vendor dashboard</p>
        <h1
          id="vendor-overview-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          Overview
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Keep track of your services, booking requests, and subscription.
        </p>
      </header>

      {status === "loading" ? <OverviewSkeleton /> : null}

      {status === "success" && overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map(({ key, label, description, icon: Icon }) => {
            const value =
              key === "currentPlan"
                ? overview.currentPlan === "premium"
                  ? "Premium"
                  : "Free"
                : overview[key];

            return (
              <Card key={key} className="min-h-40 border-border">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-3xl font-semibold">
                      {value}
                    </CardTitle>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Vendor overview could not be loaded
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
