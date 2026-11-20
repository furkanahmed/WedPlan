import EmptyState from "@/components/empty-state";

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Find your people
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-secondary sm:text-5xl">
          Browse Wedding Services
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/75">
          Discover the talented professionals who can help make your day
          unforgettable.
        </p>
      </header>
      <EmptyState
        title="Services are coming soon"
        description="We are getting the marketplace ready. Check back soon to explore wedding services."
      />
    </main>
  );
}
