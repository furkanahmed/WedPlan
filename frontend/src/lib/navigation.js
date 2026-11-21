const dashboardPaths = {
  admin: "/dashboard/admin",
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
};

export function getDashboardPath(role) {
  return dashboardPaths[role] ?? dashboardPaths.customer;
}

export function getSafeRedirectPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\r") ||
    value.includes("\n")
  ) {
    return "/";
  }

  const origin = "https://wedplan.invalid";
  const url = new URL(value, origin);

  return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : "/";
}
