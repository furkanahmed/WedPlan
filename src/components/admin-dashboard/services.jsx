"use client";

import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/empty-state";
import StatusBadge from "@/components/status-badge";
import AdminPagination from "@/components/admin-dashboard/pagination";
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
import { formatTaka } from "@/lib/currency";
import {
  deleteAdminService,
  fetchAdminServices,
  updateAdminService,
} from "@/lib/admin-api";

const pageSize = 25;

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchAdminServices({
        search,
        status: statusFilter,
        page,
        pageSize,
        signal: controller.signal,
      })
        .then((result) => {
          setServices(result.items);
          setTotal(result.total);
          setStatus("success");
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load services.",
          );
          setStatus("error");
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, statusFilter, page, attempt]);

  async function handleReview(service, nextStatus) {
    if (
      !window.confirm(
        `${nextStatus === "approved" ? "Approve" : "Reject"} "${service.serviceName}"?`,
      )
    ) {
      return;
    }

    setUpdatingId(String(service._id));
    try {
      const updatedService = await updateAdminService(service._id, {
        status: nextStatus,
      });
      if (statusFilter && updatedService.status !== statusFilter) {
        setServices((current) =>
          current.filter((item) => String(item._id) !== String(updatedService._id)),
        );
        setTotal((current) => Math.max(0, current - 1));
        if (services.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
      } else {
        setServices((current) =>
          current.map((item) =>
            String(item._id) === String(updatedService._id) ? updatedService : item,
          ),
        );
      }
      toast.success(`Service ${nextStatus}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to review service.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleAvailability(service) {
    setUpdatingId(String(service._id));
    try {
      const updatedService = await updateAdminService(service._id, {
        isActive: service.isActive !== true,
      });
      setServices((current) =>
        current.map((item) =>
          String(item._id) === String(updatedService._id) ? updatedService : item,
        ),
      );
      toast.success(
        updatedService.isActive ? "Service is active." : "Service is inactive.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update service status.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(service) {
    if (
      !window.confirm(
        `Delete "${service.serviceName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setUpdatingId(String(service._id));
    try {
      await deleteAdminService(service._id);
      setServices((current) =>
        current.filter((item) => String(item._id) !== String(service._id)),
      );
      setTotal((current) => Math.max(0, current - 1));
      if (services.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      toast.success("Service deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete service.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="space-y-7" aria-labelledby="admin-services-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin dashboard</p>
        <h1 id="admin-services-heading" className="font-heading text-3xl font-semibold sm:text-4xl">
          Manage services
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Review submissions, control availability, and remove services when needed.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setStatus("loading");
            }}
            placeholder="Search name, category, or location"
            aria-label="Search services"
            className="h-10 pl-9"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
            setStatus("loading");
          }}
          aria-label="Filter services by review status"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {status === "success" && services.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => {
              const isUpdating = updatingId === String(service._id);
              return (
                <Card key={String(service._id)} className="border-border">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="break-words text-lg">
                          {service.serviceName || "Unnamed service"}
                        </CardTitle>
                        <CardDescription>{service.category || "Uncategorized"}</CardDescription>
                      </div>
                      <StatusBadge status={service.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 break-words text-sm text-muted-foreground">
                      {service.description || "No description provided."}
                    </p>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Vendor</dt>
                        <dd className="break-words font-medium">
                          {service.vendor?.businessName ||
                            service.vendor?.name ||
                            service.vendor?.email ||
                            "Unknown vendor"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Location · Price</dt>
                        <dd className="break-words font-medium">
                          {service.location || "—"} · {formatTaka(service.price)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Availability</dt>
                        <dd className="font-medium">
                          {service.isActive ? "Active" : "Inactive"}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      {service.status !== "approved" ? (
                        <Button
                          disabled={updatingId !== ""}
                          onClick={() => handleReview(service, "approved")}
                        >
                          {isUpdating ? "Updating..." : "Approve"}
                        </Button>
                      ) : null}
                      {service.status !== "rejected" ? (
                        <Button
                          variant="outline"
                          disabled={updatingId !== ""}
                          onClick={() => handleReview(service, "rejected")}
                        >
                          Reject
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        disabled={updatingId !== ""}
                        onClick={() => handleAvailability(service)}
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={updatingId !== ""}
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 aria-hidden="true" />
                        {isUpdating ? "Working..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {status === "success" && services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="There are no services matching the selected search and status."
        />
      ) : null}

      {status === "error" ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <h2 className="font-heading text-xl font-semibold">Services could not be loaded</h2>
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
