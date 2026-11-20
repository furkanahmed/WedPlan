"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getSafeRedirectPath } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const googleCustomerOnlyMessage =
  "Google sign-in is available to customer accounts only. Use email and password for this account.";

export default function SignInForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));
  const oauthErrorHandled = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (!oauthError || oauthErrorHandled.current) {
      return;
    }

    oauthErrorHandled.current = true;
    const message =
      oauthError === "google_customer_only"
        ? googleCustomerOnlyMessage
        : "Google sign-in failed. Please try again.";
    setErrorMessage(message);
    toast.error(message);

    const remainingParams = new URLSearchParams(searchParams.toString());
    remainingParams.delete("error");
    remainingParams.delete("error_description");
    const query = remainingParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [oauthError, pathname, router, searchParams]);

  async function handleEmailSignIn(event) {
    event.preventDefault();
    setPending(true);
    setErrorMessage("");

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("You are signed in.");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setPending(true);
    setErrorMessage("");

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: new URL(redirectTo, window.location.origin).toString(),
        errorCallbackURL: new URL(
          `${window.location.pathname}${window.location.search}`,
          window.location.origin,
        ).toString(),
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in with Google.";
      setErrorMessage(message);
      toast.error(message);
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-lg border-border shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-secondary">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in to continue planning your celebration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sign-in-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="sign-in-email"
              className="h-12"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="sign-in-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="sign-in-password"
              className="h-12"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {errorMessage ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative flex items-center">
          <span className="w-full border-t border-border" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <span className="w-full border-t border-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 rounded-xl border-border bg-white text-sm font-semibold text-foreground shadow-sm shadow-foreground/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md hover:shadow-primary/10"
          disabled={pending}
          onClick={handleGoogleSignIn}
        >
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <svg
              aria-hidden="true"
              className="size-5"
              viewBox="0 0 48 48"
              fill="none"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.6-4.2 6.1v5h6.8c4-3.7 6-9.1 6-14.8Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5.3c-1.9 1.3-4.2 2-6.7 2-5.2 0-9.6-3.5-11.2-8.2H5.8v5.5C9.2 39.6 16 44 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.5H5.8a20 20 0 0 0 0 18.4l7-5.5Z"
              />
              <path
                fill="#EA4335"
                d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4 16 4 9.2 8.4 5.8 14.8l7 5.5c1.6-4.7 6-8.2 11.2-8.2Z"
              />
            </svg>
          )}
          {pending ? "Connecting to Google..." : "Continue with Google"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to WedPlan?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
