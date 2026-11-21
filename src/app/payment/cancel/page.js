import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full border-border">
        <CardHeader className="items-center text-center">
          <CardTitle className="font-heading text-2xl">
            Checkout was cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            No Premium subscription was started. You can return to your plan
            page whenever you are ready.
          </p>
          <Button render={<Link href="/dashboard/vendor/subscription" />}>
            <ArrowLeft aria-hidden="true" />
            Back to subscription
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
