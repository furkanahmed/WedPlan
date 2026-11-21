"use client";

import { useEffect, useState } from "react";
import { ImagePlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerProfile, updateCustomerProfile } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/image-upload";

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

export default function CustomerProfileForm() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomerProfile({ signal: controller.signal })
      .then((result) => {
        setProfile(result);
        setName(result.name);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load your profile.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const updates = { name };
      if (imageFile) {
        updates.image = await uploadImageToImgBB(imageFile);
      } else if (removeImage) {
        updates.image = null;
      }
      const updatedProfile = await updateCustomerProfile(updates);
      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setImageFile(null);
      setPreviewUrl("");
      setRemoveImage(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="space-y-7" aria-labelledby="customer-profile-heading">
        <header className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-48" />
        </header>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="space-y-7" aria-labelledby="customer-profile-heading">
        <header>
          <h1
            id="customer-profile-heading"
            className="font-heading text-3xl font-semibold text-foreground"
          >
            Profile
          </h1>
        </header>
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            className="mt-5"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </Button>
        </div>
      </section>
    );
  }

  const imageSource = previewUrl || (removeImage ? undefined : profile?.image) || undefined;

  return (
    <section className="mx-auto max-w-3xl space-y-7" aria-labelledby="customer-profile-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Customer dashboard</p>
        <h1
          id="customer-profile-heading"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          Profile
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Update the name and profile photo associated with your account.
        </p>
      </header>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Your email address is managed by your sign-in account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-20">
                <AvatarImage src={imageSource} alt="" />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <label
                  htmlFor="customer-profile-image"
                  className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                >
                  <ImagePlus aria-hidden="true" className="size-4" />
                  Choose profile photo
                </label>
                <Input
                  id="customer-profile-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;
                    setImageFile(selectedFile);
                    setPreviewUrl(
                      selectedFile ? URL.createObjectURL(selectedFile) : "",
                    );
                    setRemoveImage(false);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  The selected photo uploads when you save your profile.
                </p>
                {imageFile ? (
                  <p className="text-sm text-foreground">{imageFile.name}</p>
                ) : null}
                {!imageFile && profile?.image ? (
                  <button
                    type="button"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl("");
                      setRemoveImage(true);
                    }}
                  >
                    Remove current photo
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="customer-profile-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="customer-profile-name"
                autoComplete="name"
                maxLength={120}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="customer-profile-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="customer-profile-email"
                type="email"
                value={profile.email}
                readOnly
                disabled
              />
            </div>

            <Button type="submit" disabled={saving || !name.trim()}>
              <UserRound aria-hidden="true" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
