"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EmptyState from "@/components/empty-state";
import ServiceCard from "@/components/service-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublicServices } from "@/lib/api";
import { WEDDING_CATEGORIES } from "@/lib/categories";

function ServicesSkeleton() {
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

export default function ServicesBrowser({ initialCategory = "" }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setStatus("loading");
      setErrorMessage("");
      try {
        const results = await fetchPublicServices({
          search,
          category,
          location,
          sort,
          signal: controller.signal,
        });
        setServices(results);
        setStatus(results.length ? "success" : "empty");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load services.",
        );
        setStatus("error");
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, category, location, sort, attempt]);

  return (
    <div>
      <div className="mb-8 grid gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:p-5">
        <label className="relative block">
          <span className="sr-only">Search by service name</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services"
            className="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All categories</option>
            {WEDDING_CATEGORIES.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by location</span>
          <input
            type="search"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label>
          <span className="sr-only">Sort by price</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Recently added</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
          </select>
        </label>
      </div>

      {status === "loading" ? <ServicesSkeleton /> : null}
      {status === "success" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id}
              service={service}
              eager={index === 0}
            />
          ))}
        </div>
      ) : null}
      {status === "empty" ? (
        <EmptyState
          title="No services found"
          description="Try another search or clear some filters to see more wedding services."
        >
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("");
              setLocation("");
              setSort("");
            }}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Clear filters
          </button>
        </EmptyState>
      ) : null}
      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Services could not be loaded
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
