import { getMemoryStore } from "@/server/data/memory-store";
import { getTenantBundleBySlug, getTenants } from "@/server/tenants/tenant-service";
import { slugify } from "@/lib/utils";
import { type NormRecord, type TenantRecord } from "@/types/domain";

export async function getAdminOverview() {
  const tenants = await getTenants();
  const store = getMemoryStore();

  return {
    tenants,
    totalNorms: store.bundles.reduce((acc, bundle) => acc + bundle.norms.length, 0),
    totalSearches: store.searchLogs.length,
    recentSearches: store.searchLogs.slice(0, 5),
    favoriteCount: store.favorites.length
  };
}

export async function getUserByEmail(email: string) {
  return getMemoryStore().users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createTenant(input: {
  name: string;
  slug: string;
  stateCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}) {
  const store = getMemoryStore();
  const normalizedSlug = slugify(input.slug);

  const existing = store.bundles.find((bundle) => bundle.tenant.slug === normalizedSlug);
  if (existing) {
    throw new Error("Tenant ja existe.");
  }

  const defaultLogo = "/tenants/piracicaba/logo.svg";
  const tenantId = `tenant-${normalizedSlug}`;
  const tenant: TenantRecord = {
    id: tenantId,
    slug: normalizedSlug,
    name: input.name,
    stateCode: input.stateCode.toUpperCase(),
    layoutMode: "shared",
    branding: {
      logoUrl: input.logoUrl || defaultLogo,
      crestUrl: input.logoUrl || "/tenants/piracicaba/crest.svg",
      heroImageUrl: "/tenants/piracicaba/hero.svg",
      colors: {
        primary: input.primaryColor,
        secondary: input.secondaryColor,
        accent: input.accentColor,
        muted: "#F5F7FA",
        surface: "#FFFFFF",
        foreground: "#162436"
      }
    },
    profile: {
      cityName: input.name,
      stateCode: input.stateCode.toUpperCase(),
      officialHeadline: `Portal oficial de legislacao municipal de ${input.name}`,
      institutionalText: "Novo tenant criado a partir do painel administrativo.",
      howToSearch: [
        "Use a busca simples para encontrar normas por palavras-chave.",
        "Refine por tipo, ano e situacao quando souber mais detalhes."
      ],
      strategicShortcuts: [],
      homeSections: [],
      notices: []
    },
    popularThemeIds: [],
    highlightedNormIds: [],
    recentNormIds: [],
    mostAccessedNormIds: [],
    stats: {
      publishedNorms: 0,
      monthlySearches: 0,
      updatedThisYear: 0
    }
  };

  store.bundles.push({
    tenant,
    themes: [],
    normTypes: [],
    normStatuses: [],
    norms: [],
    featuredNorms: []
  });

  return tenant;
}

export async function updateTenant(id: string, input: Partial<TenantRecord>) {
  const store = getMemoryStore();
  const bundle = store.bundles.find((item) => item.tenant.id === id);

  if (!bundle) {
    throw new Error("Tenant nao encontrado.");
  }

  // Deep-merge branding so partial color updates don't wipe out existing values
  if (input.branding) {
    bundle.tenant.branding = {
      ...bundle.tenant.branding,
      ...input.branding,
      colors: {
        ...bundle.tenant.branding.colors,
        ...(input.branding.colors ?? {})
      }
    };
    delete (input as Record<string, unknown>).branding;
  }

  bundle.tenant = {
    ...bundle.tenant,
    ...input
  };

  return bundle.tenant;
}

export async function upsertNorm(
  tenantSlug: string,
  input: Pick<
    NormRecord,
    "title" | "summary" | "plainLanguageSummary" | "type" | "number" | "year" | "status" | "classification"
  >
) {
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    throw new Error("Tenant nao encontrado.");
  }

  const existing = bundle.norms.find((norm) => norm.number === input.number && norm.year === input.year && norm.type === input.type);

  if (existing) {
    existing.title = input.title;
    existing.summary = input.summary;
    existing.plainLanguageSummary = input.plainLanguageSummary;
    existing.status = input.status;
    existing.classification = input.classification;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  const created: NormRecord = {
    id: `${bundle.tenant.slug}-${slugify(`${input.type}-${input.number}-${input.year}`)}`,
    tenantId: bundle.tenant.id,
    type: input.type,
    typeLabel: input.type,
    number: input.number,
    year: input.year,
    fullCode: `${input.type} ${input.number}/${input.year}`,
    title: input.title,
    summary: input.summary,
    plainLanguageSummary: input.plainLanguageSummary,
    fullText: `${input.title}\n\nArt. 1 Conteudo inicial em elaboracao.`,
    publicationDate: new Date().toISOString().slice(0, 10),
    effectiveDate: new Date().toISOString().slice(0, 10),
    status: input.status,
    classification: input.classification,
    subject: input.classification,
    authorship: "Painel administrativo",
    initiative: "Executivo",
    sourceUrl: "#",
    pdfUrl: "#",
    accessCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    themeIds: [],
    keywords: [],
    tags: [],
    attachments: [],
    relationships: [],
    changeHistory: ["Norma cadastrada via painel administrativo."]
  };

  bundle.norms.unshift(created);
  bundle.tenant.stats.publishedNorms += 1;
  bundle.tenant.recentNormIds = [created.id, ...bundle.tenant.recentNormIds].slice(0, 3);

  return created;
}

export async function updateNormById(
  tenantSlug: string,
  normId: string,
  input: Partial<
    Pick<
      NormRecord,
      "title" | "summary" | "plainLanguageSummary" | "type" | "number" | "year" | "status" | "classification"
    >
  >
) {
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    throw new Error("Tenant nao encontrado.");
  }

  const norm = bundle.norms.find((item) => item.id === normId);

  if (!norm) {
    throw new Error("Norma nao encontrada.");
  }

  Object.assign(norm, input, {
    updatedAt: new Date().toISOString()
  });

  norm.fullCode = `${norm.type} ${norm.number}/${norm.year}`;
  norm.typeLabel = norm.type;

  return norm;
}

export async function getTenantAdminData(slug: string) {
  const bundle = await getTenantBundleBySlug(slug);

  if (!bundle) {
    return null;
  }

  const store = getMemoryStore();

  return {
    tenant: bundle.tenant,
    norms: bundle.norms,
    themes: bundle.themes,
    featured: bundle.featuredNorms,
    searches: store.searchLogs.filter((entry) => entry.tenantId === bundle.tenant.id).slice(0, 10)
  };
}

export async function getAllTenantSummaries() {
  return getTenants();
}
