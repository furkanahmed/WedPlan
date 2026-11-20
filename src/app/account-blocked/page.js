import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountBlockedPage() {
  return (
    <main className="flex items-center justify-center px-4 py-20 sm:px-6">
      <Card className="w-full max-w-lg border-border text-center shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-3xl text-secondary">
            Account blocked
          </CardTitle>
          <CardDescription className="text-base">
            This account is currently blocked. Please contact support if you
            believe this is a mistake.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
