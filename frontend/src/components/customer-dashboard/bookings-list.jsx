"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";
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
import { cancelCustomerBooking, fetchCustomerBookings } from "@/lib/api";

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value,
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

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [updatingBookingId, setUpdatingBookingId] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomerBookings({ signal: controller.signal })
      .then((result) => {
        setBookings(result);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load your bookings.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  async function handleCancel(booking) {
    if (!window.confirm("Cancel this booking request?")) {
      return;
    }

    const bookingId = String(booking._id);
    setUpdatingBookingId(bookingId);
    try {
      const updatedBooking = await cancelCustomerBooking(bookingId);
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          String(currentBooking._id) === bookingId
            ? { ...currentBooking, ...updatedBooking }
            : currentBooking,
        ),
      );
      toast.success("Booking cancelled.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel this booking.",
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
    <section className="space-y-7" aria-labelledby="customer-bookings-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Customer dashboard</p>
        <h1
          id="customer-bookings-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          My Bookings
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Review your booking requests and cancel bookings that are no longer needed.
        </p>
      </header>

      {status === "loading" ? <BookingsSkeleton /> : null}

      {status === "success" ? (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Filter bookings">
            {["all", "pending", "accepted", "rejected", "cancelled"].map(
              (filterValue) => (
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
              ),
            )}
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
                          Requested{" "}
                          {formatDate(booking.createdAt)}
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays aria-hidden="true" className="size-4" />
                          Event date
                        </dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {formatDate(booking.eventDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-2 text-muted-foreground">
                          <MapPin aria-hidden="true" className="size-4" />
                          Event location
                        </dt>
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
                    {booking.status === "pending" ||
                    booking.status === "accepted" ? (
                      <Button
                        variant="destructive"
                        disabled={updatingBookingId !== ""}
                        onClick={() => handleCancel(booking)}
                      >
                        <X aria-hidden="true" />
                        {updatingBookingId === String(booking._id)
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bookings found"
              description={
                filter === "all"
                  ? "Your booking requests will appear here."
                  : `You do not have any ${filter} bookings.`
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
            Bookings could not be loaded
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
