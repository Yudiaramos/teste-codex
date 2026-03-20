import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getMemoryStore } from "@/server/data/memory-store";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export async function GET(_: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const items = getMemoryStore().favorites.filter(
    (favorite) => favorite.tenantId === bundle.tenant.id && favorite.userEmail === session.user.email
  );

  return NextResponse.json({ items });
}

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const { normId } = (await request.json()) as { normId?: string };

  if (!normId) {
    return NextResponse.json({ message: "normId e obrigatorio." }, { status: 400 });
  }

  const store = getMemoryStore();
  const existing = store.favorites.find(
    (favorite) =>
      favorite.tenantId === bundle.tenant.id && favorite.normId === normId && favorite.userEmail === session.user.email
  );

  if (!existing) {
    store.favorites.unshift({
      id: `favorite-${Date.now()}`,
      tenantId: bundle.tenant.id,
      userEmail: session.user.email,
      normId,
      createdAt: new Date().toISOString()
    });
  }

  return NextResponse.json({ ok: true });
}
