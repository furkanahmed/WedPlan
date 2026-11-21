"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  Menu,
  Settings2,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Manage users", icon: UsersRound },
  { href: "/dashboard/admin/services", label: "Manage services", icon: Settings2 },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
];

function NavigationLinks({ pathname, onNavigate }) {
  return (
    <nav aria-label="Admin dashboard" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="border-b border-border bg-background px-4 py-3 lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" aria-label="Open admin dashboard menu" />
            }
          >
            <Menu aria-hidden="true" />
            <span>Admin menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 max-w-[calc(100%-2rem)]">
            <SheetHeader>
              <SheetTitle className="text-secondary">Admin dashboard</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <NavigationLinks
                pathname={pathname}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
        <div className="sticky top-20">
          <h2 className="mb-5 px-3 font-heading text-lg font-semibold text-secondary">
            Admin dashboard
          </h2>
          <NavigationLinks pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
