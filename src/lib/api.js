import { authClient } from "@/lib/auth-client";

export async function fetchAuthenticatedApi(path, { method = "GET", body, signal } = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured to load account data.");
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
    throw new Error("A valid sign-in token is required to load account data.");
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
    throw new Error("The account server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to complete the account request.",
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
  const overview = await fetchAuthenticatedApi("/api/v1/vendor/overview", { signal });
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
  const services = await fetchAuthenticatedApi("/api/v1/vendor/services", { signal });
  if (!Array.isArray(services)) {
    throw new Error("The vendor services server returned an invalid service list.");
  }
  return services;
}

export async function fetchVendorService(serviceId, { signal } = {}) {
  const service = await fetchAuthenticatedApi(
    `/api/v1/vendor/services/${encodeURIComponent(serviceId)}`,
    { signal },
  );
  if (!service || typeof service !== "object") {
    throw new Error("The vendor services server returned an invalid service.");
  }
  return service;
}

export async function createVendorService(service, { signal } = {}) {
  return fetchAuthenticatedApi("/api/v1/services", {
    method: "POST",
    body: service,
    signal,
  });
}

export async function updateVendorService(serviceId, service, { signal } = {}) {
  return fetchAuthenticatedApi(`/api/v1/services/${encodeURIComponent(serviceId)}`, {
    method: "PATCH",
    body: service,
    signal,
  });
}

export async function deleteVendorService(serviceId, { signal } = {}) {
  return fetchAuthenticatedApi(`/api/v1/services/${encodeURIComponent(serviceId)}`, {
    method: "DELETE",
    signal,
  });
}

export async function createBooking(booking, { signal } = {}) {
  return fetchAuthenticatedApi("/api/v1/bookings", {
    method: "POST",
    body: booking,
    signal,
  });
}

export async function fetchVendorBookings({ signal } = {}) {
  const bookings = await fetchAuthenticatedApi("/api/v1/bookings", { signal });
  if (!Array.isArray(bookings)) {
    throw new Error("The vendor bookings server returned an invalid booking list.");
  }
  return bookings;
}

export async function updateVendorBookingStatus(bookingId, status, { signal } = {}) {
  return fetchAuthenticatedApi(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      method: "PATCH",
      body: { status },
      signal,
    },
  );
}

export async function fetchCustomerOverview({ signal } = {}) {
  const overview = await fetchAuthenticatedApi("/api/v1/customer/overview", {
    signal,
  });
  if (
    !overview ||
    !Number.isInteger(overview.totalBookings) ||
    !Number.isInteger(overview.pendingBookings) ||
    !Number.isInteger(overview.acceptedBookings) ||
    !Number.isInteger(overview.rejectedBookings)
  ) {
    throw new Error("The customer dashboard server returned invalid summary data.");
  }
  return overview;
}

export async function fetchCustomerBookings({ signal } = {}) {
  const bookings = await fetchAuthenticatedApi("/api/v1/customer/bookings", {
    signal,
  });
  if (!Array.isArray(bookings)) {
    throw new Error("The customer server returned an invalid booking list.");
  }
  return bookings;
}

export async function cancelCustomerBooking(bookingId, { signal } = {}) {
  return fetchAuthenticatedApi(
    `/api/v1/customer/bookings/${encodeURIComponent(bookingId)}/cancel`,
    { method: "PATCH", signal },
  );
}

export async function fetchCustomerProfile({ signal } = {}) {
  const profile = await fetchAuthenticatedApi("/api/v1/customer/profile", {
    signal,
  });
  if (
    !profile ||
    typeof profile.name !== "string" ||
    typeof profile.email !== "string" ||
    (profile.image !== null && typeof profile.image !== "string")
  ) {
    throw new Error("The customer profile server returned invalid profile data.");
  }
  return profile;
}

export async function updateCustomerProfile(profile, { signal } = {}) {
  const updatedProfile = await fetchAuthenticatedApi(
    "/api/v1/customer/profile",
    { method: "PATCH", body: profile, signal },
  );
  if (
    !updatedProfile ||
    typeof updatedProfile.name !== "string" ||
    typeof updatedProfile.email !== "string" ||
    (updatedProfile.image !== null && typeof updatedProfile.image !== "string")
  ) {
    throw new Error("The customer profile server returned invalid profile data.");
  }
  return updatedProfile;
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
