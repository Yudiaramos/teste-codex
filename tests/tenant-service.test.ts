import { describe, expect, it } from "vitest";

import { getTenantBySlug, normalizeTenantSlug } from "@/server/tenants/tenant-service";

describe("tenant-service", () => {
  it("normaliza o slug do tenant", () => {
    expect(normalizeTenantSlug("Piracicaba-SP")).toBe("piracicaba-sp");
  });

  it("resolve tenant mesmo com maiusculas", async () => {
    const tenant = await getTenantBySlug("Piracicaba-SP");

    expect(tenant?.slug).toBe("piracicaba-sp");
    expect(tenant?.name).toBe("Piracicaba");
  });
});
