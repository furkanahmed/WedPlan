import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const signupOptions = [
  {
    href: "/sign-up/customer",
    title: "Sign up as Customer",
    description: "Find wedding professionals and plan your celebration.",
  },
  {
    href: "/sign-up/vendor",
    title: "Sign up as Vendor",
    description: "Share your services with couples planning their wedding.",
  },
];

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center px-4 py-16 sm:px-6">
      <section className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-semibold text-secondary sm:text-4xl">
            Join WedPlan
          </h1>
          <p className="mt-3 text-muted-foreground">
            Choose the account type that best fits you.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {signupOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card className="h-full border-border shadow-sm transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
