import { Suspense } from "react";
import ServicesBrowser from "@/components/services-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { getWeddingCategory } from "@/lib/categories";

function ServicesPageHeader() {
  return (
    <header className="mb-8">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Find your people
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold text-secondary sm:text-5xl">
        Browse Wedding Services
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-foreground">
        Discover the talented professionals who can help make your day
        unforgettable.
      </p>
    </header>
  );
}

function ServicesPageFallback() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <ServicesPageHeader />
      <div className="mb-8 grid gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4] w-full rounded-2xl" />
        ))}
      </div>
    </main>
  );
}

async function ServicesPageContent({ searchParams }) {
  const params = await searchParams;
  const initialCategory = getWeddingCategory(
    typeof params?.category === "string" ? params.category : "",
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <ServicesPageHeader />
      <ServicesBrowser initialCategory={initialCategory} />
    </main>
  );
}

export default function ServicesPage({ searchParams }) {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
