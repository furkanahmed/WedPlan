import Link from "next/link";
import { Facebook, Heart, Instagram, Mail } from "lucide-react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/",
    label: "Instagram",
    icon: Instagram,
  },
  { href: "https://www.facebook.com/", label: "Facebook", icon: Facebook },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-secondary text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link
            href="/"
            aria-label="WedPlan home"
            className="inline-flex items-center gap-2"
          >
            <Heart
              aria-hidden="true"
              className="size-6 fill-primary text-primary"
            />
            <span className="font-heading text-xl font-semibold">WedPlan</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-background/75">
            Find the right wedding professionals and bring your celebration
            together with confidence.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold">Explore</h2>
          <ul className="mt-4 space-y-3">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-background/75 transition-colors hover:text-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold">Contact</h2>
          <a
            href="mailto:hello@wedplan.com"
            className="mt-4 inline-flex items-center gap-2 text-sm text-background/75 transition-colors hover:text-background"
          >
            <Mail aria-hidden="true" className="size-4" />
            hello@wedplan.com
          </a>
        </div>

        <div>
          <h2 className="font-heading text-lg font-semibold">Follow Along</h2>
          <div className="mt-4 flex gap-3">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded-full border border-background/20 p-2 text-background/75 transition-colors hover:border-accent hover:text-background"
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-background/15 px-4 py-5 text-center text-xs text-background/70">
        © {new Date().getFullYear()} WedPlan. All rights reserved.
      </div>
    </footer>
  );
}
