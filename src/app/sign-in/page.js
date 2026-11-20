import { Suspense } from "react";
import SignInForm from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Loading sign-in form...
          </p>
        }
      >
        <SignInForm />
      </Suspense>
    </main>
  );
}
