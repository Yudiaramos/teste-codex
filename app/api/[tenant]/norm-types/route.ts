import { NextResponse } from "next/server";

import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json({
    types: bundle.normTypes,
    statuses: bundle.normStatuses
  });
}
