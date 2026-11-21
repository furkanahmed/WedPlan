"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImageToImgBB } from "@/lib/image-upload";
import {
  createVendorService,
  fetchVendorService,
  updateVendorService,
} from "@/lib/api";
import { WEDDING_CATEGORIES } from "@/lib/categories";

const emptyService = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  location: "",
  images: "",
};

function ServiceFormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function VendorServiceForm({ serviceId }) {
  const router = useRouter();
  const isEditing = Boolean(serviceId);
  const [form, setForm] = useState(emptyService);
  const [loadStatus, setLoadStatus] = useState(isEditing ? "loading" : "ready");
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const selectedImagesRef = useRef([]);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(
    () => () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    const controller = new AbortController();

    fetchVendorService(serviceId, { signal: controller.signal })
      .then((service) => {
        setForm({
          serviceName: service.serviceName || "",
          category: service.category || "",
          description: service.description || "",
          price: String(service.price ?? ""),
          location: service.location || "",
          images: Array.isArray(service.images) ? service.images.join("\n") : "",
        });
        setLoadStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error ? error.message : "Unable to load this service.",
        );
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [serviceId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Choose image files only.");
    }

    const newImages = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadedUrl: "",
    }));

    setSelectedImages((currentImages) => {
      const nextImages = [...currentImages, ...newImages];
      selectedImagesRef.current = nextImages;
      return nextImages;
    });
    event.target.value = "";
  }

  function removeSelectedImage(imageId) {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      const nextImages = currentImages.filter((image) => image.id !== imageId);
      selectedImagesRef.current = nextImages;
      return nextImages;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const images = form.images
        .split(/\r?\n/)
        .map((image) => image.trim())
        .filter(Boolean);

      for (let index = 0; index < selectedImages.length; index += 1) {
        const selectedImage = selectedImages[index];
        setUploadProgress(
          `Uploading image ${index + 1} of ${selectedImages.length}...`,
        );
        const imageUrl =
          selectedImage.uploadedUrl ||
          (await uploadImageToImgBB(selectedImage.file));
        images.push(imageUrl);

        if (!selectedImage.uploadedUrl) {
          setSelectedImages((currentImages) => {
            const nextImages = currentImages.map((image) =>
              image.id === selectedImage.id
                ? { ...image, uploadedUrl: imageUrl }
                : image,
            );
            selectedImagesRef.current = nextImages;
            return nextImages;
          });
        }
      }

      const service = {
        serviceName: form.serviceName,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        images,
      };

      if (isEditing) {
        await updateVendorService(serviceId, service);
        toast.success("Service updated.");
      } else {
        await createVendorService(service);
        toast.success("Service submitted for review.");
      }
      router.push("/dashboard/vendor/services");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save this service.",
      );
    } finally {
      setUploadProgress("");
      setIsSaving(false);
    }
  }

  const title = isEditing ? "Edit Service" : "Add Service";

  return (
    <section className="mx-auto max-w-3xl space-y-7" aria-labelledby="service-form-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Vendor dashboard</p>
        <h1
          id="service-form-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update the details couples see about your service."
            : "Add the details for a service your business offers."}
        </p>
      </header>

      {loadStatus === "loading" ? (
        <Card>
          <CardContent className="space-y-5 p-6">
            <ServiceFormSkeleton />
          </CardContent>
        </Card>
      ) : null}

      {loadStatus === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8"
        >
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button
            className="mt-5"
            variant="outline"
            render={<Link href="/dashboard/vendor/services" />}
          >
            Back to My Services
          </Button>
        </div>
      ) : null}

      {loadStatus === "ready" ? (
        <Card className="border-border">
          <CardContent className="p-5 sm:p-7">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Service name</span>
                <Input
                  name="serviceName"
                  value={form.serviceName}
                  onChange={updateField}
                  maxLength={120}
                  required
                  className="h-12"
                  placeholder="e.g. Wedding photography package"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Category</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  required
                  className="h-12 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {WEDDING_CATEGORIES.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={5000}
                  required
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe what is included in this service"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Price (BDT)</span>
                  <Input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={updateField}
                    min="0.01"
                    step="any"
                    required
                    className="h-12"
                    placeholder="25000"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Location</span>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    maxLength={100}
                    required
                    className="h-12"
                    placeholder="City or area"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Image URLs (optional)</span>
                <textarea
                  name="images"
                  value={form.images}
                  onChange={updateField}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Add one public image URL per line"
                />
                <span className="block text-xs text-muted-foreground">
                  Keep one public HTTP or HTTPS image link per line.
                </span>
              </label>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Upload images to ImgBB</span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isSaving}
                    onChange={handleImageSelection}
                    className="h-auto cursor-pointer py-3 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                  />
                  <span className="block text-xs text-muted-foreground">
                    Select multiple image files. They will upload when you submit the service; each image can be up to 32 MB.
                  </span>
                </label>

                {selectedImages.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedImages.map((image) => (
                      <li
                        key={image.id}
                        className="overflow-hidden rounded-xl border border-border"
                      >
                        <div className="relative aspect-[4/3] bg-muted">
                          <Image
                            src={image.previewUrl}
                            alt={`Preview of ${image.file.name}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Remove ${image.file.name}`}
                            disabled={isSaving}
                            onClick={() => removeSelectedImage(image.id)}
                            className="absolute right-2 top-2 bg-background/90"
                          >
                            <X aria-hidden="true" />
                          </Button>
                        </div>
                        <p className="truncate px-3 py-2 text-xs text-muted-foreground">
                          {image.file.name}
                          {image.uploadedUrl ? " · Uploaded" : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {uploadProgress ? (
                  <p role="status" className="text-sm text-primary">
                    <ImagePlus
                      aria-hidden="true"
                      className="mr-2 inline size-4"
                    />
                    {uploadProgress}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : isEditing ? "Save changes" : "Submit service"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  render={<Link href="/dashboard/vendor/services" />}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
