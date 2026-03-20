import { NextResponse } from "next/server";

import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getTenantBundleBySlug(slug);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
