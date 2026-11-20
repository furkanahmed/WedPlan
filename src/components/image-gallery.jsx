"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

function getImageSources(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((source) => {
    if (typeof source !== "string" || !source.trim()) {
      return false;
    }
    if (source.startsWith("/") && !source.startsWith("//")) {
      return true;
    }
    try {
      const url = new URL(source);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  });
}

export default function ImageGallery({ images, alt }) {
  const [failedImages, setFailedImages] = useState(() => new Set());
  const sources = getImageSources(images);
  const availableSources = sources.filter((source) => !failedImages.has(source));

  if (!availableSources.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
        <div className="text-center">
          <ImageOff aria-hidden="true" className="mx-auto size-8" />
          <p className="mt-2 text-sm">Images unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 ${
        availableSources.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {availableSources.map((source, index) => (
        <div
          key={`${source}-${index}`}
          className={`relative overflow-hidden rounded-2xl bg-muted ${
            index === 0 ? "aspect-[16/10] sm:col-span-1" : "aspect-[16/10]"
          }`}
        >
          <Image
            src={source}
            alt={`${alt}${index ? ` ${index + 1}` : ""}`}
            fill
            unoptimized
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            onError={() =>
              setFailedImages((current) => {
                const next = new Set(current);
                next.add(source);
                return next;
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
