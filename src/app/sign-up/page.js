import { Suspense } from "react";
import SignUpForm from "./sign-up-form";

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Loading sign-up form...
          </p>
        }
      >
        <SignUpForm />
      </Suspense>
    </main>
  );
}
