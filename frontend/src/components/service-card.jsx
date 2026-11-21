"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { formatTaka } from "@/lib/currency";

function getImageSource(images) {
  const source = Array.isArray(images) ? images[0] : null;
  if (typeof source !== "string" || !source.trim()) {
    return null;
  }
  if (source.startsWith("/") && !source.startsWith("//")) {
    return source;
  }

  try {
    const url = new URL(source);
    return ["http:", "https:"].includes(url.protocol) ? source : null;
  } catch {
    return null;
  }
}

export default function ServiceCard({ service, eager = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = getImageSource(service?.images);
  const validService =
    typeof service?._id === "string" &&
    service._id.length > 0 &&
    typeof service.serviceName === "string" &&
    service.serviceName.trim().length > 0;

  if (!validService) {
    return (
      <article className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
        <ImageOff aria-hidden="true" className="size-8 text-muted-foreground" />
        <h3 className="mt-3 font-heading text-lg font-semibold text-secondary">
          Service unavailable
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This listing could not be displayed.
        </p>
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-secondary/5"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {imageSource && !imageFailed ? (
          <Image
            src={imageSource}
            alt={service.serviceName}
            fill
            unoptimized
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-8" />
            <span className="text-sm">Image unavailable</span>
          </div>
        )}
        {service.vendor?.isPremium ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Premium Vendor
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          {service.category || "Wedding service"}
        </p>
        <h3 className="mt-2 line-clamp-2 font-heading text-xl font-semibold text-secondary">
          {service.serviceName}
        </h3>
        <p className="mt-3 text-lg font-semibold text-foreground">
          {formatTaka(service.price)}
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{service.location || "Location unavailable"}</span>
        </p>
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Provided by</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {service.vendor?.businessName ||
              service.vendor?.name ||
              "Wedding professional"}
          </p>
        </div>
        <Link
          href={`/services/${encodeURIComponent(service._id)}`}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View Details
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </motion.article>
  );
}
