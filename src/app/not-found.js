import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex items-center justify-center px-4 py-20 sm:px-6">
      <Card className="w-full max-w-lg border-border text-center shadow-sm">
        <CardHeader>
          <p className="font-heading text-6xl font-semibold text-primary">
            404
          </p>
          <CardTitle className="text-3xl text-secondary">
            This page wandered off
          </CardTitle>
          <CardDescription className="text-base">
            We could not find the page you were looking for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/">Back to WedPlan</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
