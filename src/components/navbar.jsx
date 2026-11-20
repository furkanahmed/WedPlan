"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          aria-label="WedPlan home"
          className="flex items-center gap-2"
        >
          <Heart
            aria-hidden="true"
            className="size-6 fill-primary text-primary"
          />
          <span className="font-heading text-xl font-semibold text-secondary">
            WedPlan
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign In
          </Link>
          <Button render={<Link href="/sign-up" />}>Sign Up</Button>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 max-w-[calc(100%-2rem)]">
            <SheetHeader>
              <SheetTitle className="text-secondary">WedPlan</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {[...links, { href: "/sign-in", label: "Sign In" }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Button
                className="mt-2"
                render={
                  <Link href="/sign-up" onClick={() => setMenuOpen(false)} />
                }
              >
                Sign Up
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
