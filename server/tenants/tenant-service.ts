import { getMemoryStore } from "@/server/data/memory-store";
import { type TenantBundle, type TenantRecord } from "@/types/domain";

export function normalizeTenantSlug(slug: string) {
  return decodeURIComponent(slug).trim().toLowerCase();
}

export async function getTenantBundles(): Promise<TenantBundle[]> {
  return getMemoryStore().bundles;
}

export async function getTenants(): Promise<TenantRecord[]> {
  const bundles = await getTenantBundles();
  return bundles.map((bundle) => bundle.tenant);
}

export async function getTenantBundleBySlug(slug: string): Promise<TenantBundle | null> {
  const normalized = normalizeTenantSlug(slug);
  const bundles = await getTenantBundles();

  return bundles.find((bundle) => bundle.tenant.slug === normalized) ?? null;
}

export async function getTenantBySlug(slug: string): Promise<TenantRecord | null> {
  const bundle = await getTenantBundleBySlug(slug);
  return bundle?.tenant ?? null;
}
