"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/empty-state";
import ServiceCard from "@/components/service-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublicServices } from "@/lib/api";

function FeaturedSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border p-4"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-4 h-4 w-1/3" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-5 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function HomeFeaturedServices() {
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => fetchPublicServices({ signal: controller.signal }))
      .then((results) => {
        setServices(results.slice(0, 6));
        setStatus(results.length ? "success" : "empty");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load services.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Handpicked for your day
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-secondary sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-3 max-w-2xl text-foreground">
              Explore approved wedding professionals ready to help make your
              celebration special.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex h-10 shrink-0 items-center gap-2 font-semibold text-primary hover:text-secondary"
          >
            Browse all services
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </motion.div>

        {status === "loading" ? <FeaturedSkeleton /> : null}
        {status === "success" ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  eager={index === 0}
                />
              ))}
            </div>
            {services.length < 6 ? (
              <p className="mt-5 text-center text-sm text-muted-foreground">
                More approved services will appear here as they become
                available.
              </p>
            ) : null}
          </>
        ) : null}
        {status === "empty" ? (
          <EmptyState
            title="No featured services yet"
            description="Approved and available wedding services will appear here."
          />
        ) : null}
        {status === "error" ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
          >
            <h3 className="font-heading text-xl font-semibold text-secondary">
              Featured services could not be loaded
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setAttempt((value) => value + 1);
              }}
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-secondary"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
