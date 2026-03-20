import { NextResponse } from "next/server";

import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ items: bundle.themes });
}
