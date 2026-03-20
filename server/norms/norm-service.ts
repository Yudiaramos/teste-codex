import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import { type NormChangeEvent, type NormRecord, type NormTextVersion } from "@/types/domain";

export async function getNormsByTenant(tenantSlug: string): Promise<NormRecord[]> {
  const bundle = await getTenantBundleBySlug(tenantSlug);
  return bundle?.norms ?? [];
}

export async function getNormById(tenantSlug: string, normId: string): Promise<NormRecord | null> {
  const norms = await getNormsByTenant(tenantSlug);
  return norms.find((norm) => norm.id === normId) ?? null;
}

export async function getNormRelatedItems(tenantSlug: string, normId: string) {
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    return [];
  }

  const norm = bundle.norms.find((item) => item.id === normId);

  if (!norm) {
    return [];
  }

  return norm.relationships
    .map((relation) => bundle.norms.find((item) => item.id === relation.relatedNormId))
    .filter((item): item is NormRecord => Boolean(item));
}

export function getNormTextVersions(norm: NormRecord): NormTextVersion[] {
  return [...(norm.textVersions ?? [])].sort((a, b) => a.validFrom.localeCompare(b.validFrom));
}

export function getNormChangeEvents(norm: NormRecord): NormChangeEvent[] {
  return [...(norm.changeEvents ?? [])].sort((a, b) => a.order - b.order);
}

export function getCurrentNormText(norm: NormRecord) {
  return getNormTextVersions(norm).find((version) => version.isCurrent)?.fullText ?? norm.fullText;
}

export function getOriginalNormText(norm: NormRecord) {
  return getNormTextVersions(norm).find((version) => version.kind === "original")?.fullText ?? norm.fullText;
}

export function getLatestPreviousNormText(norm: NormRecord) {
  const versions = getNormTextVersions(norm).filter((version) => !version.isCurrent);
  return versions.at(-1)?.fullText ?? null;
}

export function extractArticleIndex(fullText: string) {
  return fullText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^Art\.\s*\d+/i.test(line))
    .map((line) => ({
      id: line
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      label: line.split(".")[0]?.trim() ?? line,
      content: line
    }));
}
