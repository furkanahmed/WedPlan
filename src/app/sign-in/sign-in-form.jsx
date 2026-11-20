"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
          className="w-full"
          disabled={pending}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
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
