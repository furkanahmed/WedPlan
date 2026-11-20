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
