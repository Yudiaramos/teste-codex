import { NextResponse } from "next/server";

import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const items = bundle.featuredNorms
    .map((entry) => ({
      ...entry,
      norm: bundle.norms.find((norm) => norm.id === entry.normId) ?? null
    }))
    .filter((item) => item.norm);

  return NextResponse.json({ items });
}
