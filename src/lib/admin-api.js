import { fetchAuthenticatedApi } from "@/lib/api";

function adminQueryString({ search, role, status, page = 1, pageSize = 25 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (typeof search === "string" && search.trim()) {
    query.set("search", search.trim());
  }
  if (typeof role === "string" && role) {
    query.set("role", role);
  }
  if (typeof status === "string" && status) {
    query.set("status", status);
  }
  return query.toString();
}

function assertAdminPage(result, resourceName) {
  if (
    !result ||
    !Array.isArray(result.items) ||
    !Number.isInteger(result.total) ||
    !Number.isInteger(result.page) ||
    !Number.isInteger(result.pageSize)
  ) {
    throw new Error(`The admin server returned an invalid ${resourceName} list.`);
  }
  return result;
}

export async function fetchAdminOverview({ signal } = {}) {
  const overview = await fetchAuthenticatedApi("/api/v1/admin/overview", { signal });
  const countFields = [
    "totalUsers",
    "totalVendors",
    "totalCustomers",
    "totalServices",
    "pendingServices",
    "totalTransactions",
  ];
  if (
    !overview ||
    countFields.some(
      (field) => !Number.isInteger(overview[field]) || overview[field] < 0,
    )
  ) {
    throw new Error("The admin server returned invalid summary data.");
  }
  return overview;
}

export async function fetchAdminUsers(
  { signal, ...filters } = {},
) {
  const query = adminQueryString(filters);
  const result = await fetchAuthenticatedApi(
    `/api/v1/admin/users?${query}`,
    { signal },
  );
  return assertAdminPage(result, "user");
}

export async function updateAdminUserBlock(userId, isBlocked, { signal } = {}) {
  return fetchAuthenticatedApi(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/block`,
    { method: "PATCH", body: { isBlocked }, signal },
  );
}

export async function fetchAdminServices(
  { signal, ...filters } = {},
) {
  const query = adminQueryString(filters);
  const result = await fetchAuthenticatedApi(
    `/api/v1/admin/services?${query}`,
    { signal },
  );
  return assertAdminPage(result, "service");
}

export async function updateAdminService(serviceId, fields, { signal } = {}) {
  return fetchAuthenticatedApi(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}`,
    { method: "PATCH", body: fields, signal },
  );
}

export async function deleteAdminService(serviceId, { signal } = {}) {
  return fetchAuthenticatedApi(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}`,
    { method: "DELETE", signal },
  );
}

export async function fetchAdminTransactions(
  { signal, ...filters } = {},
) {
  const query = adminQueryString(filters);
  const result = await fetchAuthenticatedApi(
    `/api/v1/admin/transactions?${query}`,
    { signal },
  );
  return assertAdminPage(result, "transaction");
}
