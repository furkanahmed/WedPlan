"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
import AdminPagination from "@/components/admin-dashboard/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminTransactions } from "@/lib/admin-api";

const pageSize = 25;

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function getId(value) {
  if (!value) return "—";
  return typeof value === "object" && value.toString
    ? value.toString()
    : String(value);
}

function formatValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }
  return fallback;
}

function formatAmount(amount, currency) {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    typeof currency !== "string"
  ) {
    return "Not recorded";
  }

  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    });
    const fractionDigits = formatter.resolvedOptions().maximumFractionDigits;
    return formatter.format(amount / 10 ** fractionDigits);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminTransactions({ page, pageSize, signal: controller.signal })
      .then((result) => {
        setTransactions(result.items);
        setTotal(result.total);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load transactions.",
        );
        setStatus("error");
      });
    return () => controller.abort();
  }, [page, attempt]);

  return (
    <section className="space-y-7" aria-labelledby="admin-transactions-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin dashboard</p>
        <h1 id="admin-transactions-heading" className="font-heading text-3xl font-semibold sm:text-4xl">
          Transactions
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Review recorded subscription payments. This view does not change payment records.
        </p>
      </header>

      {status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {status === "success" && transactions.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {transactions.map((transaction) => (
              <Card key={getId(transaction._id)} className="border-border">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="break-all text-base">
                      Transaction {getId(transaction._id)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={transaction.status} />
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-semibold">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Plan</dt>
                      <dd className="font-medium">{formatValue(transaction.plan)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Vendor ID</dt>
                      <dd className="break-all font-medium">
                        {getId(transaction.vendorId)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Stripe Checkout session</dt>
                      <dd className="break-all font-medium">
                        {formatValue(transaction.stripeSessionId)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Stripe subscription</dt>
                      <dd className="break-all font-medium">
                        {formatValue(transaction.stripeSubscriptionId)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {status === "success" && transactions.length === 0 ? (
        <EmptyState
          title="No transactions recorded"
          description="Transaction records will appear here when the payment flow writes them to the transaction collection."
        >
          <CreditCard aria-hidden="true" className="mx-auto size-5 text-muted-foreground" />
        </EmptyState>
      ) : null}

      {status === "error" ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <h2 className="font-heading text-xl font-semibold">Transactions could not be loaded</h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
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
      ) : null}
    </section>
  );
}
