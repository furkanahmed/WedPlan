"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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
  fetchVendorBookings,
  updateVendorBookingStatus,
} from "@/lib/api";

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00.000Z`
      : value,
  );
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function BookingsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [updatingBookingId, setUpdatingBookingId] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    fetchVendorBookings({ signal: controller.signal })
      .then((result) => {
        setBookings(result);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load booking requests.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  async function handleStatusChange(booking, nextStatus) {
    setUpdatingBookingId(String(booking._id));
    try {
      const updatedBooking = await updateVendorBookingStatus(
        booking._id,
        nextStatus,
      );
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          String(currentBooking._id) === String(booking._id)
            ? { ...currentBooking, ...updatedBooking }
            : currentBooking,
        ),
      );
      toast.success(
        nextStatus === "accepted"
          ? "Booking request accepted."
          : "Booking request rejected.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the booking request.",
      );
    } finally {
      setUpdatingBookingId("");
    }
  }

  const visibleBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  return (
    <section className="space-y-7" aria-labelledby="vendor-bookings-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Vendor dashboard</p>
        <h1
          id="vendor-bookings-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          Booking Requests
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Review customer requests and accept or reject each booking.
        </p>
      </header>

      {status === "loading" ? <BookingsSkeleton /> : null}

      {status === "success" ? (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Filter bookings">
            {["all", "pending", "accepted", "rejected"].map((filterValue) => (
              <button
                key={filterValue}
                type="button"
                onClick={() => setFilter(filterValue)}
                aria-pressed={filter === filterValue}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  filter === filterValue
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
              </button>
            ))}
          </div>

          {visibleBookings.length > 0 ? (
            <div className="grid gap-4">
              {visibleBookings.map((booking) => (
                <Card key={booking._id} className="border-border">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle>{booking.serviceName || "Wedding service"}</CardTitle>
                        <CardDescription>
                          Requested by {booking.customer || "Customer"}
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Event date</dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {formatDate(booking.eventDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Event location</dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {booking.eventLocation || "Location unavailable"}
                        </dd>
                      </div>
                    </dl>
                    <div>
                      <p className="text-sm text-muted-foreground">Message</p>
                      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/50 px-4 py-3 text-sm text-foreground">
                        {booking.message || "No message provided."}
                      </p>
                    </div>
                    {booking.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={updatingBookingId !== ""}
                          onClick={() => handleStatusChange(booking, "accepted")}
                        >
                          <Check aria-hidden="true" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={updatingBookingId !== ""}
                          onClick={() => handleStatusChange(booking, "rejected")}
                        >
                          <X aria-hidden="true" />
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No booking requests"
              description={
                filter === "all"
                  ? "New customer booking requests will appear here."
                  : `There are no ${filter} booking requests.`
              }
            />
          )}
        </>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Booking requests could not be loaded
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
