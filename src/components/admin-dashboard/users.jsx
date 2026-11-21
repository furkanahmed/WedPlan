"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPagination from "@/components/admin-dashboard/pagination";
import { fetchAdminUsers, updateAdminUserBlock } from "@/lib/admin-api";

const pageSize = 25;

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString();
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchAdminUsers({ search, role, page, pageSize, signal: controller.signal })
        .then((result) => {
          setUsers(result.items);
          setTotal(result.total);
          setStatus("success");
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load users.",
          );
          setStatus("error");
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, role, page, attempt]);

  async function handleBlockChange(user) {
    const isBlocked = user.isBlocked !== true;
    const action = isBlocked ? "block" : "unblock";
    if (!window.confirm(`${action === "block" ? "Block" : "Unblock"} ${user.name || user.email}?`)) {
      return;
    }

    setUpdatingId(String(user._id));
    try {
      const updatedUser = await updateAdminUserBlock(user._id, isBlocked);
      setUsers((current) =>
        current.map((item) =>
          String(item._id) === String(updatedUser._id) ? updatedUser : item,
        ),
      );
      toast.success(isBlocked ? "User blocked." : "User unblocked.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="space-y-7" aria-labelledby="admin-users-heading">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Admin dashboard</p>
        <h1 id="admin-users-heading" className="font-heading text-3xl font-semibold sm:text-4xl">
          Manage users
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Find accounts, review their details, and manage account access.
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
            placeholder="Search name, email, or business"
            aria-label="Search users"
            className="h-10 pl-9"
          />
        </label>
        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
            setStatus("loading");
          }}
          aria-label="Filter users by role"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {status === "success" && users.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isUpdating = updatingId === String(user._id);
              return (
                <Card key={String(user._id)} className="border-border">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="break-words text-lg">
                          {user.name || "Unnamed user"}
                        </CardTitle>
                        <p className="mt-1 break-all text-sm text-muted-foreground">
                          {user.email || "No email"}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                        {user.role || "unknown"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Business</dt>
                        <dd className="break-words font-medium">{user.businessName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Joined</dt>
                        <dd className="font-medium">{formatDate(user.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Account status</dt>
                        <dd className="font-medium">
                          {user.isBlocked ? "Blocked" : "Active"}
                        </dd>
                      </div>
                    </dl>
                    {isAdmin ? (
                      <p className="text-xs text-muted-foreground">
                        Admin accounts are protected from blocking.
                      </p>
                    ) : (
                      <Button
                        variant={user.isBlocked ? "outline" : "destructive"}
                        disabled={isUpdating || updatingId !== ""}
                        onClick={() => handleBlockChange(user)}
                      >
                        {user.isBlocked ? (
                          <ShieldCheck aria-hidden="true" />
                        ) : (
                          <ShieldOff aria-hidden="true" />
                        )}
                        {isUpdating
                          ? "Updating..."
                          : user.isBlocked
                            ? "Unblock user"
                            : "Block user"}
                      </Button>
                    )}
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

      {status === "success" && users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search or role filter."
        />
      ) : null}

      {status === "error" ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <h2 className="font-heading text-xl font-semibold">Users could not be loaded</h2>
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
