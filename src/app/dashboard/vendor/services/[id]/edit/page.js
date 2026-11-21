import { Suspense, use } from "react";
import VendorServiceForm from "@/components/vendor-dashboard/service-form";

function EditVendorServiceContent({ params }) {
  const { id } = use(params);
  return <VendorServiceForm serviceId={id} />;
}

export default function EditVendorServicePage({ params }) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-muted"
        />
      }
    >
      <EditVendorServiceContent params={params} />
    </Suspense>
  );
}
