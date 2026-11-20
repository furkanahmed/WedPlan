import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid min-h-[min(42rem,calc(100vh-4rem))] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium text-secondary">
              <Heart aria-hidden="true" className="size-4 fill-primary text-primary" />
              Made for your forever
            </p>
            <h1 className="font-heading text-5xl leading-[1.08] font-semibold tracking-tight text-secondary sm:text-6xl">
              Your day, your way.
              <span className="mt-2 block text-primary">Let&apos;s plan it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground">
              Find the people and services that make your wedding feel
              unmistakably yours. Your celebration starts with the right
              inspiration.
            </p>
            <Button
              size="lg"
              className="mt-9 h-12 rounded-full px-6"
              render={
                <Link href="/services">
                  Explore Wedding Services
                  <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                </Link>
              }
            />
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#F7E8E3_0%,#F7E8E3_25%,#E9C9C0_25%,#E9C9C0_45%,#D8B36A_45%,#D8B36A_48%,#FFFDF9_48%)]"
          >
            <div className="rounded-full bg-background/90 p-8 text-center shadow-lg shadow-secondary/10 backdrop-blur">
              <Heart className="mx-auto size-10 fill-primary text-primary" />
              <p className="mt-3 font-heading text-2xl font-semibold text-secondary">
                Plan with love
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white/60 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-secondary">
              The beginning of something beautiful
            </h2>
            <p className="mt-2 max-w-2xl text-foreground">
              Browse the services that will bring your ideas to life.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-primary/5"
            render={<Link href="/services">Browse Services</Link>}
          />
        </div>
      </section>
    </main>
  );
}
