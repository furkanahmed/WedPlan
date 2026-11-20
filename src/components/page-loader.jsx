import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading content</span>
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="grid gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-border p-5"
          >
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
