import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/navigation";

const serviceDetailPath = /^\/services\/[^/]+\/?$/;
const dashboardRoles = new Set(["admin", "customer", "vendor"]);

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isServiceDetail = serviceDetailPath.test(pathname);
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!isServiceDetail && !isDashboard) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (session.user.isBlocked) {
    return NextResponse.redirect(new URL("/account-blocked", request.url));
  }

  if (isDashboard) {
    const dashboardPath = getDashboardPath(session.user.role);
    const allowedRole = dashboardPath.split("/")[2];
    const requestedRole = pathname.split("/")[2];

    if (
      pathname === "/dashboard" ||
      !dashboardRoles.has(requestedRole) ||
      requestedRole !== allowedRole
    ) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/services/:id", "/dashboard/:path*"],
};
