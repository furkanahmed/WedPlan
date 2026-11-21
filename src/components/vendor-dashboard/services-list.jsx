"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
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
  deleteVendorService,
  fetchVendorOverview,
  fetchVendorServices,
  updateVendorService,
} from "@/lib/api";
import { formatTaka } from "@/lib/currency";

const FREE_ACTIVE_SERVICE_LIMIT = 3;

function ServicesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="min-h-48">
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [deletingServiceId, setDeletingServiceId] = useState("");
  const [updatingServiceId, setUpdatingServiceId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchVendorServices({ signal: controller.signal }),
      fetchVendorOverview({ signal: controller.signal }),
    ])
      .then(([serviceResult, overviewResult]) => {
        setServices(serviceResult);
        setOverview(overviewResult);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load your services.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  const hasReachedFreeLimit =
    overview?.currentPlan === "free" &&
    overview.activeServices >= FREE_ACTIVE_SERVICE_LIMIT;

  async function handleAvailabilityChange(service) {
    const isActive = service.isActive !== true;
    setUpdatingServiceId(String(service._id));
    try {
      const updatedService = await updateVendorService(service._id, { isActive });
      setServices((currentServices) =>
        currentServices.map((currentService) =>
          String(currentService._id) === String(service._id)
            ? updatedService
            : currentService,
        ),
      );
      setOverview((currentOverview) =>
        currentOverview
          ? {
              ...currentOverview,
              activeServices: Math.max(
                0,
                currentOverview.activeServices + (isActive ? 1 : -1),
              ),
            }
          : currentOverview,
      );
      toast.success(isActive ? "Service is now available." : "Service is unavailable.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update availability.",
      );
    } finally {
      setUpdatingServiceId("");
    }
  }

  async function handleDelete(service) {
    const confirmed = window.confirm(
      `Delete "${service.serviceName}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingServiceId(String(service._id));
    try {
      await deleteVendorService(service._id);
      setServices((currentServices) =>
        currentServices.filter(
          (currentService) => String(currentService._id) !== String(service._id),
        ),
      );
      toast.success("Service deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete this service.",
      );
    } finally {
      setDeletingServiceId("");
    }
  }

  return (
    <section className="space-y-7" aria-labelledby="vendor-services-heading">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Vendor dashboard</p>
          <h1
            id="vendor-services-heading"
            className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
          >
            My Services
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Review and manage the services listed by your business.
          </p>
        </div>
        {hasReachedFreeLimit ? (
          <Button className="shrink-0" disabled>
            <Plus aria-hidden="true" />
            Add Service
          </Button>
        ) : (
          <Button
            render={<Link href="/dashboard/vendor/services/new" />}
            className="shrink-0"
          >
            <Plus aria-hidden="true" />
            Add Service
          </Button>
        )}
      </header>

      {overview ? (
        <div
          className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
          aria-live="polite"
        >
          <p className="font-medium text-foreground">
            {overview.currentPlan === "premium"
              ? `Premium plan · ${overview.activeServices} active services`
              : `Free plan · ${overview.activeServices}/${FREE_ACTIVE_SERVICE_LIMIT} active services`}
          </p>
          {hasReachedFreeLimit ? (
            <p className="mt-1 text-muted-foreground">
              You have reached the free-plan limit. Turn off an active service before adding or activating another.
            </p>
          ) : null}
        </div>
      ) : null}

      {status === "loading" ? <ServicesSkeleton /> : null}

      {status === "success" && services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service._id} className="border-border">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="break-words text-lg font-semibold">
                      {service.serviceName}
                    </CardTitle>
                    <CardDescription>{service.category}</CardDescription>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-semibold text-foreground">
                  {formatTaka(service.price)}
                </p>
                <p className="text-sm text-muted-foreground">{service.location}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium">Availability</span>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={service.isActive === true}
                      disabled={
                        updatingServiceId !== "" ||
                        (hasReachedFreeLimit && service.isActive !== true)
                      }
                      onChange={() => handleAvailabilityChange(service)}
                      aria-label={`Availability for ${service.serviceName}`}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="relative h-6 w-11 rounded-full bg-muted transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-background after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">
                      {service.isActive ? "Available" : "Unavailable"}
                    </span>
                  </label>
                </div>
                {hasReachedFreeLimit && service.isActive !== true ? (
                  <p className="text-xs text-muted-foreground">
                    Deactivate another service to make this one available.
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={`/dashboard/vendor/services/${encodeURIComponent(service._id)}/edit`}
                      />
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deletingServiceId === String(service._id)}
                    onClick={() => handleDelete(service)}
                  >
                    <Trash2 aria-hidden="true" />
                    {deletingServiceId === String(service._id)
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {status === "success" && services.length === 0 ? (
        <EmptyState
          title="You have no services yet"
          description="Add your first service to introduce your business to couples."
        >
          {hasReachedFreeLimit ? (
            <p className="text-sm text-muted-foreground">
              Deactivate one of your other services before adding another.
            </p>
          ) : (
            <Button render={<Link href="/dashboard/vendor/services/new" />}>
              <Plus aria-hidden="true" />
              Add your first service
            </Button>
          )}
        </EmptyState>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Your services could not be loaded
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
