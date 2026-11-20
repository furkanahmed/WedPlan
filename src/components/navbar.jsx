"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "W"
  );
}

function ProfileAvatar({ user }) {
  return (
    <Avatar>
      <AvatarImage src={user.image || undefined} alt="" />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

function ProfileMenu({ user, dashboardPath, onSignOut }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 max-w-56 gap-2 px-2"
            aria-label="Open profile menu"
          />
        }
      >
        <ProfileAvatar user={user} />
        <span className="truncate">{user.name || "Your account"}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {user.name || user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={dashboardPath} />}>
          <LayoutDashboard aria-hidden="true" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={`${dashboardPath}/profile`} />}
        >
          <Settings aria-hidden="true" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const dashboardPath = getDashboardPath(user?.role);

  async function handleSignOut() {
    setMenuOpen(false);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw new Error(error.message);
      }

      toast.success("You have been signed out.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign out.";
      toast.error(message);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          aria-label="WedPlan home"
          className="flex items-center gap-2"
        >
          <Heart
            aria-hidden="true"
            className="size-6 fill-primary text-primary"
          />
          <span className="font-heading text-xl font-semibold text-secondary">
            WedPlan
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {isPending ? (
            <Skeleton aria-label="Loading account" className="h-9 w-28" />
          ) : user ? (
            <ProfileMenu
              user={user}
              dashboardPath={dashboardPath}
              onSignOut={handleSignOut}
            />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Sign In
              </Link>
              <Button render={<Link href="/sign-up" />}>Sign Up</Button>
            </>
          )}
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 max-w-[calc(100%-2rem)]">
            <SheetHeader>
              <SheetTitle className="text-secondary">WedPlan</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {isPending ? (
                <Skeleton
                  aria-label="Loading account"
                  className="mx-3 my-3 h-10 w-40"
                />
              ) : user ? (
                <>
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex items-center gap-3 border-b border-border px-3 py-4">
                    <ProfileAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.name || "Your account"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`${dashboardPath}/profile`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    Profile Settings
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start px-3"
                    onClick={handleSignOut}
                  >
                    <LogOut aria-hidden="true" className="mr-2 size-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <Button
                    className="mt-2"
                    render={
                      <Link
                        href="/sign-up"
                        onClick={() => setMenuOpen(false)}
                      />
                    }
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
