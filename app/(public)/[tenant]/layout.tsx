import { notFound } from "next/navigation";

import { TenantShell } from "@/components/layout/tenant-shell";
import { getTenantBySlug } from "@/server/tenants/tenant-service";

export default async function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return <TenantShell tenant={tenant}>{children}</TenantShell>;
}
