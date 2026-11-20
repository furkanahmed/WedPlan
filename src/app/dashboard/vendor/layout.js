import VendorSidebar from "@/components/vendor-dashboard/sidebar";

export default function VendorDashboardLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col lg:flex-row">
      <VendorSidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
