import { getMemoryStore } from "@/server/data/memory-store";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import type { NormRecord, NormChangeKind } from "@/types/domain";

// ─── AI Provider Interface ──────────────────────────────────────────────────
// Generic interface — plug in OpenAI, Gemini, or any other provider later.

export interface ExtractedNormData {
  typeCode: string;
  typeLabel: string;
  number: string;
  year: number;
  title: string;
  summary: string;
  plainLanguageSummary: string;
  fullText: string;
  tags: string[];
  classification: string;
  subject: string;
  authorship: string;
  initiative: string;
  publicationDate: string;
  /** If this is an amendment to an existing norm */
  amendsNormCode?: string;
  changeKind?: NormChangeKind;
}

export interface NormExtractionProvider {
  /**
   * Extract structured legislation data from raw text.
   * The text may come from a PDF (already extracted) or another source.
   */
  extractFromText(rawText: string, tenantSlug: string): Promise<ExtractedNormData>;
}

// ─── Default Stub Provider ─────────────────────────────────────────────────
// Returns a best-effort parse without AI. Good for testing or when no LLM key is set.

class StubExtractionProvider implements NormExtractionProvider {
  async extractFromText(rawText: string, _tenantSlug: string): Promise<ExtractedNormData> {
    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    const firstLine = lines[0] ?? "Norma sem título";

    // Simple heuristic: try to detect type from first line
    const typeDetections: { pattern: RegExp; code: string; label: string }[] = [
      { pattern: /lei\s+org[aâ]nica/i, code: "lei-organica", label: "Lei Orgânica" },
      { pattern: /lei\s+complementar/i, code: "lei-complementar", label: "Leis Complementares" },
      { pattern: /lei\s+ordin[aá]ria/i, code: "lei-ordinaria", label: "Leis Ordinárias" },
      { pattern: /decreto\s+legislativo/i, code: "decreto-legislativo", label: "Decretos Legislativos" },
      { pattern: /decreto\s+municipal/i, code: "decreto-municipal", label: "Decretos Municipais" },
      { pattern: /decreto/i, code: "decreto-municipal", label: "Decretos Municipais" },
      { pattern: /resolu[çc][aã]o/i, code: "resolucao", label: "Resoluções" },
      { pattern: /emenda/i, code: "emenda-lei-organica", label: "Emendas à Lei Orgânica" },
      { pattern: /ato\s+da\s+mesa/i, code: "ato-mesa", label: "Atos da Mesa" },
      { pattern: /ato\s+da\s+presid[eê]ncia/i, code: "ato-presidencia", label: "Atos da Presidência" }
    ];

    let detectedType = { code: "lei-ordinaria", label: "Leis Ordinárias" };
    for (const det of typeDetections) {
      if (det.pattern.test(firstLine) || det.pattern.test(rawText.slice(0, 500))) {
        detectedType = { code: det.code, label: det.label };
        break;
      }
    }

    // Try to extract number and year
    const numYearMatch = firstLine.match(/n[°º.]?\s*(\d+)[\s,/]+(?:de\s+)?(\d{4})/i) ??
      rawText.match(/n[°º.]?\s*(\d+)[\s,/]+(?:de\s+)?(\d{4})/i);
    const number = numYearMatch?.[1] ?? "0";
    const year = numYearMatch ? Number.parseInt(numYearMatch[2], 10) : new Date().getFullYear();

    return {
      typeCode: detectedType.code,
      typeLabel: detectedType.label,
      number,
      year,
      title: firstLine.slice(0, 200),
      summary: lines.slice(0, 3).join(" ").slice(0, 300),
      plainLanguageSummary: "Resumo em linguagem simples gerado automaticamente.",
      fullText: rawText,
      tags: [detectedType.code],
      classification: "Geral",
      subject: "Legislação municipal",
      authorship: "Não identificado",
      initiative: "Não identificado",
      publicationDate: new Date().toISOString().split("T")[0]
    };
  }
}

// ─── Ingestion Service ────────────────────────────────────────────────────

let extractionProvider: NormExtractionProvider = new StubExtractionProvider();

export function setExtractionProvider(provider: NormExtractionProvider) {
  extractionProvider = provider;
}

export interface IngestionResult {
  norm: NormRecord;
  action: "created" | "updated" | "skipped";
  message: string;
}

/**
 * Ingest raw text (from a PDF or other source) into the system.
 * Uses the configured AI provider to extract structured data,
 * then creates or updates the norm in the memory store.
 */
export async function ingestText(
  tenantSlug: string,
  rawText: string,
  uploaderEmail: string
): Promise<IngestionResult> {
  const bundle = await getTenantBundleBySlug(tenantSlug);
  if (!bundle) {
    throw new Error(`Tenant '${tenantSlug}' not found`);
  }

  const extracted = await extractionProvider.extractFromText(rawText, tenantSlug);
  const store = getMemoryStore();
  const bundleInStore = store.bundles.find((b) => b.tenant.id === bundle.tenant.id);
  if (!bundleInStore) {
    throw new Error(`Bundle for tenant '${tenantSlug}' not found in store`);
  }

  // Check if norm already exists by matching type + number + year
  const existingNorm = bundleInStore.norms.find(
    (n) =>
      n.tenantId === bundle.tenant.id &&
      n.type === extracted.typeCode &&
      n.number === extracted.number &&
      n.year === extracted.year
  );

  if (existingNorm) {
    // If existing text is identical, skip
    if (existingNorm.fullText.trim() === extracted.fullText.trim()) {
      return {
        norm: existingNorm,
        action: "skipped",
        message: `Norma ${existingNorm.fullCode} já existe com texto idêntico.`
      };
    }

    // Update the existing norm
    existingNorm.fullText = extracted.fullText;
    existingNorm.summary = extracted.summary;
    existingNorm.tags = [...new Set([...(existingNorm.tags ?? []), ...extracted.tags])];
    existingNorm.updatedAt = new Date().toISOString();

    // Audit log
    store.auditLogs.unshift({
      id: `audit-ingest-${Date.now()}`,
      tenantId: bundle.tenant.id,
      userEmail: uploaderEmail,
      action: "ingest-update",
      targetType: "norm",
      targetId: existingNorm.id,
      createdAt: new Date().toISOString()
    });

    return {
      norm: existingNorm,
      action: "updated",
      message: `Norma ${existingNorm.fullCode} atualizada com sucesso.`
    };
  }

  // Create new norm
  const normId = `${bundle.tenant.slug}-ingest-${Date.now()}`;
  const now = new Date().toISOString();
  const fullCode = `${extracted.typeLabel} ${extracted.number}/${extracted.year}`;

  const newNorm: NormRecord = {
    id: normId,
    tenantId: bundle.tenant.id,
    type: extracted.typeCode,
    typeLabel: extracted.typeLabel,
    number: extracted.number,
    year: extracted.year,
    fullCode,
    title: extracted.title,
    summary: extracted.summary,
    plainLanguageSummary: extracted.plainLanguageSummary,
    fullText: extracted.fullText,
    publicationDate: extracted.publicationDate,
    effectiveDate: extracted.publicationDate,
    status: "vigente",
    classification: extracted.classification,
    subject: extracted.subject,
    authorship: extracted.authorship,
    initiative: extracted.initiative,
    sourceUrl: "",
    pdfUrl: "",
    accessCount: 0,
    createdAt: now,
    updatedAt: now,
    themeIds: [],
    keywords: [],
    tags: extracted.tags,
    attachments: [],
    relationships: [],
    changeHistory: [`Norma ingerida automaticamente em ${now.split("T")[0]}.`]
  };

  bundleInStore.norms.push(newNorm);

  // Audit log
  store.auditLogs.unshift({
    id: `audit-ingest-${Date.now()}`,
    tenantId: bundle.tenant.id,
    userEmail: uploaderEmail,
    action: "ingest-create",
    targetType: "norm",
    targetId: normId,
    createdAt: now
  });

  return {
    norm: newNorm,
    action: "created",
    message: `Norma ${fullCode} criada com sucesso.`
  };
}
