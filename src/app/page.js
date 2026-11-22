import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Flower2,
  Heart,
  MapPin,
  Sparkles,
  Shirt,
  Utensils,
} from "lucide-react";
import HomeFeaturedServices from "@/components/home-featured-services";
import Reveal from "@/components/reveal";
import { WEDDING_CATEGORIES } from "@/lib/categories";

const categoryIcons = [Camera, MapPin, Flower2, Utensils, Sparkles, Shirt];

const benefits = [
  "Discover trusted wedding professionals in one place",
  "Compare services, prices, and locations with ease",
  "Find a team that fits your vision and your budget",
];

const steps = [
  {
    number: "01",
    title: "Explore",
    description: "Browse wedding services and discover local professionals.",
  },
  {
    number: "02",
    title: "Choose",
    description: "Compare details and find the services that feel right.",
  },
  {
    number: "03",
    title: "Celebrate",
    description: "Bring your plans together and enjoy your special day.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#FFFDF9_0%,#FFFDF9_48%,rgba(255,253,249,0.2)_100%)]" />
        <div className="mx-auto grid min-h-[min(42rem,calc(100vh-4rem))] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-secondary">
              <Heart aria-hidden="true" className="size-4 fill-primary text-primary" />
              Made for your forever
            </p>
            <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-tight text-secondary sm:text-6xl">
              Your day, your way.
              <span className="mt-2 block text-primary">Let&apos;s plan it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground">
              Find trusted wedding professionals and bring your celebration to
              life, all in one place.
            </p>
            <Link
              href="/services"
              className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-secondary hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Explore Wedding Services
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] ring-1 ring-border/70 shadow-2xl shadow-primary/10 sm:rounded-[3rem]">
              <Image
                src="/wedding-hero.svg"
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <HomeFeaturedServices />

      <section className="border-y border-border bg-white/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Browse by category
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-secondary sm:text-4xl">
              Find the perfect fit
            </h2>
            <p className="mt-3 text-foreground">
              Start with the services that matter most to your celebration.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEDDING_CATEGORIES.map(({ name, slug }, index) => {
              const Icon = categoryIcons[index];
              return (
                <Reveal key={slug}>
                  <Link
                    href={`/services?category=${encodeURIComponent(slug)}`}
                    className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-secondary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-heading text-lg font-semibold text-secondary">
                        {name}
                      </span>
                      <span className="mt-1 inline-flex items-center text-sm text-muted-foreground group-hover:text-primary">
                        Explore category
                        <ArrowRight
                          aria-hidden="true"
                          className="ml-1 size-4"
                        />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Why WedPlan
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-secondary sm:text-4xl">
              Why Choose WedPlan?
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-foreground">
              Planning your wedding should feel exciting. WedPlan makes it
              easier to discover the right people and services for your day.
            </p>
          </Reveal>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <Reveal key={benefit}>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check aria-hidden="true" className="size-4" />
                  </span>
                  <p className="font-medium text-foreground">{benefit}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 text-background sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase">
              A simple start
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              How WedPlan Works
            </h2>
            <p className="mt-3 text-background/80">
              A few simple steps from inspiration to celebration.
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <Reveal key={step.number}>
                <article className="h-full rounded-2xl border border-background/15 bg-background/5 p-6">
                  <span className="font-heading text-3xl font-semibold text-accent">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-6 text-background/80">
                    {step.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
