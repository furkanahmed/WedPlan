import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There is nothing to show right now.",
  children,
}) {
  return (
    <section className="flex min-h-64 items-center justify-center px-4 py-12 text-center">
      <div className="flex max-w-md flex-col items-center">
        <span className="mb-4 rounded-full bg-muted p-4 text-secondary">
          <Inbox aria-hidden="true" className="size-7" />
        </span>
        <h2 className="font-heading text-2xl font-semibold text-secondary">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
