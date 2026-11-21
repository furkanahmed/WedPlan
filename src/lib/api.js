import { authClient } from "@/lib/auth-client";

async function fetchVendorApi(path, { method = "GET", body, signal } = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured to load vendor data.");
  }

  let url;
  try {
    url = new URL(path, apiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid server URL.");
  }

  const { data: tokenData, error: tokenError } = await authClient.token();
  if (tokenError) {
    throw new Error(tokenError.message || "Unable to authenticate with the services server.");
  }
  if (typeof tokenData?.token !== "string" || !tokenData.token) {
    throw new Error("A valid sign-in token is required to load vendor data.");
  }

  const headers = {
    Authorization: `Bearer ${tokenData.token}`,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The vendor server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to complete the vendor request.",
    );
  }

  return result?.data;
}

export async function fetchPublicServices({ signal, ...filters } = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured to load services.");
  }

  let url;
  try {
    url = new URL("/api/v1/services", apiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid server URL.");
  }

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string" && value.trim()) {
      url.searchParams.set(key, value.trim());
    }
  }

  const response = await fetch(url, { signal });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The services server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to load wedding services.",
    );
  }
  if (!Array.isArray(result?.data)) {
    throw new Error("The services server returned an invalid services list.");
  }

  return result.data;
}

export async function fetchVendorOverview({ signal } = {}) {
  const overview = await fetchVendorApi("/api/v1/vendor/overview", { signal });
  if (
    !overview ||
    !Number.isInteger(overview.totalServices) ||
    !Number.isInteger(overview.activeServices) ||
    !Number.isInteger(overview.pendingRequests) ||
    !Number.isInteger(overview.acceptedBookings) ||
    !["free", "premium"].includes(overview.currentPlan)
  ) {
    throw new Error("The vendor dashboard server returned invalid summary data.");
  }

  return overview;
}

export async function fetchVendorServices({ signal } = {}) {
  const services = await fetchVendorApi("/api/v1/vendor/services", { signal });
  if (!Array.isArray(services)) {
    throw new Error("The vendor services server returned an invalid service list.");
  }
  return services;
}

export async function fetchVendorService(serviceId, { signal } = {}) {
  const service = await fetchVendorApi(
    `/api/v1/vendor/services/${encodeURIComponent(serviceId)}`,
    { signal },
  );
  if (!service || typeof service !== "object") {
    throw new Error("The vendor services server returned an invalid service.");
  }
  return service;
}

export async function createVendorService(service, { signal } = {}) {
  return fetchVendorApi("/api/v1/services", {
    method: "POST",
    body: service,
    signal,
  });
}

export async function updateVendorService(serviceId, service, { signal } = {}) {
  return fetchVendorApi(`/api/v1/services/${encodeURIComponent(serviceId)}`, {
    method: "PATCH",
    body: service,
    signal,
  });
}

export async function deleteVendorService(serviceId, { signal } = {}) {
  return fetchVendorApi(`/api/v1/services/${encodeURIComponent(serviceId)}`, {
    method: "DELETE",
    signal,
  });
}

export async function createBooking(booking, { signal } = {}) {
  return fetchVendorApi("/api/v1/bookings", {
    method: "POST",
    body: booking,
    signal,
  });
}

export async function fetchVendorBookings({ signal } = {}) {
  const bookings = await fetchVendorApi("/api/v1/bookings", { signal });
  if (!Array.isArray(bookings)) {
    throw new Error("The vendor bookings server returned an invalid booking list.");
  }
  return bookings;
}

export async function updateVendorBookingStatus(bookingId, status, { signal } = {}) {
  return fetchVendorApi(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      method: "PATCH",
      body: { status },
      signal,
    },
  );
}

export async function fetchPublicService(serviceId, { signal } = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured to load service details.");
  }

  let url;
  try {
    url = new URL(`/api/v1/services/${encodeURIComponent(serviceId)}`, apiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid server URL.");
  }

  const response = await fetch(url, { signal });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The services server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to load the service.",
    );
  }
  if (!result?.data || typeof result.data !== "object") {
    throw new Error("The services server returned an invalid service.");
  }

  return result.data;
}
