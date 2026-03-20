import { NextResponse } from "next/server";

import { getNormById } from "@/server/norms/norm-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant, id } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const norm = await getNormById(bundle.tenant.slug, id);

  if (!norm) {
    return NextResponse.json({ message: "Norma nao encontrada." }, { status: 404 });
  }

  return NextResponse.json(norm);
}
