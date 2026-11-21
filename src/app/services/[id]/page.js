"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, MapPin, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/empty-state";
import ImageGallery from "@/components/image-gallery";
import { Skeleton } from "@/components/ui/skeleton";
import { createBooking, fetchPublicService } from "@/lib/api";
import { formatTaka } from "@/lib/currency";

function ServiceDetailsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-40" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </main>
  );
}

function ServiceDetailsContent() {
  const { id: serviceId } = useParams();
  const [service, setService] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    eventDate: "",
    eventLocation: "",
    message: "",
  });
  const [bookingStatus, setBookingStatus] = useState("idle");

  function updateBookingField(event) {
    const { name, value } = event.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();
    setBookingStatus("submitting");
    try {
      await createBooking({
        serviceId,
        eventDate: bookingForm.eventDate,
        eventLocation: bookingForm.eventLocation,
        message: bookingForm.message,
      });
      setBookingForm({
        eventDate: "",
        eventLocation: "",
        message: "",
      });
      setBookingStatus("submitted");
      toast.success("Booking request sent.");
    } catch (error) {
      setBookingStatus("idle");
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the booking request.",
      );
    }
  }

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    const controller = new AbortController();

    fetchPublicService(serviceId, { signal: controller.signal })
      .then((result) => {
        setService(result);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load service details.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [serviceId, attempt]);

  if (status === "loading") {
    return <ServiceDetailsLoading />;
  }

  if (status === "error") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Service unavailable"
          description={errorMessage}
        >
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-secondary"
          >
            Try again
          </button>
        </EmptyState>
      </main>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Browse
      </Link>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <ImageGallery images={service.images} alt={service.serviceName} />

        <article>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {service.category || "Wedding service"}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-secondary sm:text-4xl">
            {service.serviceName}
          </h1>
          {service.vendor?.isPremium ? (
            <span className="mt-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Premium Vendor
            </span>
          ) : null}
          <p className="mt-5 text-2xl font-semibold text-foreground">
            {formatTaka(service.price)}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4" />
            {service.location || "Location unavailable"}
          </p>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Provided by</p>
            <p className="mt-1 font-heading text-lg font-semibold text-secondary">
              {service.vendor?.businessName ||
                service.vendor?.name ||
                "Wedding professional"}
            </p>
          </div>

          <p className="mt-6 leading-7 text-foreground">
            {service.description || "No description is available for this service."}
          </p>

          <form
            className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-5"
            onSubmit={handleBookingSubmit}
          >
            <h2 className="font-heading text-xl font-semibold text-secondary">
              Request this service
            </h2>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Event date</span>
              <input
                name="eventDate"
                type="date"
                value={bookingForm.eventDate}
                onChange={updateBookingField}
                required
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Event location</span>
              <input
                name="eventLocation"
                type="text"
                value={bookingForm.eventLocation}
                onChange={updateBookingField}
                maxLength={100}
                required
                placeholder="Venue or area"
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Message</span>
              <textarea
                name="message"
                value={bookingForm.message}
                onChange={updateBookingField}
                maxLength={3000}
                required
                rows={4}
                placeholder="Tell the vendor about your plan"
                className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <button
              type="submit"
              disabled={bookingStatus === "submitting"}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              <CalendarDays aria-hidden="true" className="size-4" />
              {bookingStatus === "submitting"
                ? "Sending..."
                : "Send booking request"}
            </button>
          </form>
        </article>
      </div>
    </main>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense fallback={<ServiceDetailsLoading />}>
      <ServiceDetailsContent />
    </Suspense>
  );
}
