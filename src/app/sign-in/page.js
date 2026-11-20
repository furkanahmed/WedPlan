import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full max-w-lg border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-secondary">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue planning your celebration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5">
          <p className="text-center text-sm text-muted-foreground">
            Account access will be available soon.
          </p>
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/services">Explore services instead</Link>}
          />
          <p className="text-sm text-muted-foreground">
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
    </main>
  );
}
