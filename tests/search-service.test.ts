import { describe, expect, it } from "vitest";

import { upsertNorm } from "@/server/admin/admin-service";
import { searchService } from "@/server/search/search-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

describe("search-service", () => {
  it("filtra resultados por tenant", async () => {
    const piracicaba = await searchService.search("piracicaba-sp", { query: "tributario" });
    const campinas = await searchService.search("campinas-sp", { query: "tributario" });

    expect(piracicaba.items.some((item) => item.tenantId.includes("piracicaba"))).toBe(true);
    expect(campinas.items.some((item) => item.tenantId.includes("campinas"))).toBe(false);
  });

  it("busca por numero e ano", async () => {
    const result = await searchService.search("piracicaba-sp", {
      number: "405",
      year: 2023
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.fullCode).toBe("Lei Complementar 405/2023");
  });

  it("retorna sugestoes", async () => {
    const suggestions = await searchService.suggest("campinas-sp", "mobi");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("cria normas administrativas com tags inicializadas", async () => {
    const created = await upsertNorm("piracicaba-sp", {
      title: "Norma administrativa de teste",
      summary: "Resumo da norma administrativa de teste",
      plainLanguageSummary: "Resumo simples da norma administrativa de teste",
      type: "Lei",
      number: "99991",
      year: 2026,
      status: "vigente",
      classification: "Administrativo"
    });

    expect(created.tags).toEqual([]);
  });

  it("nao quebra a busca com dados legados sem tags ou keywords", async () => {
    const bundle = await getTenantBundleBySlug("piracicaba-sp");

    expect(bundle).not.toBeNull();

    const legacyNorm = {
      ...bundle!.norms[0],
      id: "piracicaba-legacy-search-test",
      fullCode: "Lei 99992/2026",
      title: "Norma legada de busca",
      number: "99992",
      year: 2026,
      tags: undefined as unknown as string[],
      keywords: undefined as unknown as string[]
    };

    bundle!.norms.unshift(legacyNorm);

    try {
      const result = await searchService.search("piracicaba-sp", { query: "legada" });
      const suggestions = await searchService.suggest("piracicaba-sp", "lega");

      expect(result.items.some((item) => item.id === legacyNorm.id)).toBe(true);
      expect(suggestions).toContain("Norma legada de busca");
    } finally {
      bundle!.norms = bundle!.norms.filter((norm) => norm.id !== legacyNorm.id);
    }
  });
});
