import { PrismaClient } from "@prisma/client";

import { demoBundles, demoUsers } from "@/server/data/demo-content";

const prisma = new PrismaClient();

async function main() {
  await prisma.favoriteNorm.deleteMany();
  await prisma.notificationSubscription.deleteMany();
  await prisma.searchLog.deleteMany();
  await prisma.featuredNorm.deleteMany();
  await prisma.normRelationship.deleteMany();
  await prisma.normAttachment.deleteMany();
  await prisma.normStatusHistory.deleteMany();
  await prisma.normThemeAssignment.deleteMany();
  await prisma.norm.deleteMany();
  await prisma.normTheme.deleteMany();
  await prisma.normStatus.deleteMany();
  await prisma.normType.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.municipalityProfile.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.tenant.deleteMany();

  const roleMap = new Map<string, string>();
  for (const role of [
    { code: "GLOBAL_ADMIN", label: "Administrador Global" },
    { code: "TENANT_ADMIN", label: "Administrador de Municipio" },
    { code: "CITIZEN", label: "Cidadao autenticado" }
  ]) {
    const created = await prisma.role.create({
      data: {
        code: role.code,
        label: role.label
      }
    });
    roleMap.set(role.code, created.id);
  }

  const tenantIdBySlug = new Map<string, string>();

  for (const bundle of demoBundles) {
    const tenant = await prisma.tenant.create({
      data: {
        slug: bundle.tenant.slug,
        name: bundle.tenant.name,
        stateCode: bundle.tenant.stateCode,
        layoutMode: bundle.tenant.layoutMode === "municipal-spotlight" ? "municipal_spotlight" : "shared",
        logoUrl: bundle.tenant.branding.logoUrl,
        crestUrl: bundle.tenant.branding.crestUrl,
        heroImageUrl: bundle.tenant.branding.heroImageUrl,
        primaryColor: bundle.tenant.branding.colors.primary,
        secondaryColor: bundle.tenant.branding.colors.secondary,
        accentColor: bundle.tenant.branding.colors.accent,
        mutedColor: bundle.tenant.branding.colors.muted,
        surfaceColor: bundle.tenant.branding.colors.surface,
        foregroundColor: bundle.tenant.branding.colors.foreground,
        municipality: {
          create: {
            cityName: bundle.tenant.profile.cityName,
            stateCode: bundle.tenant.profile.stateCode,
            officialHeadline: bundle.tenant.profile.officialHeadline,
            institutionalText: bundle.tenant.profile.institutionalText,
            howToSearch: bundle.tenant.profile.howToSearch,
            strategicShortcuts: bundle.tenant.profile.strategicShortcuts,
            homeSections: bundle.tenant.profile.homeSections,
            notices: bundle.tenant.profile.notices
          }
        }
      }
    });

    tenantIdBySlug.set(bundle.tenant.slug, tenant.id);

    const typeMap = new Map<string, string>();
    for (const type of bundle.normTypes) {
      const created = await prisma.normType.create({
        data: {
          tenantId: tenant.id,
          code: type.code,
          label: type.label
        }
      });
      typeMap.set(type.code, created.id);
    }

    const statusMap = new Map<string, string>();
    for (const status of bundle.normStatuses) {
      const created = await prisma.normStatus.create({
        data: {
          tenantId: tenant.id,
          code: status.code,
          label: status.label,
          description: status.description
        }
      });
      statusMap.set(status.code, created.id);
    }

    const themeMap = new Map<string, string>();
    for (const theme of bundle.themes) {
      const created = await prisma.normTheme.create({
        data: {
          tenantId: tenant.id,
          name: theme.name,
          slug: theme.slug,
          description: theme.description,
          popularity: theme.popularity
        }
      });
      themeMap.set(theme.id, created.id);
    }

    const normMap = new Map<string, string>();
    for (const norm of bundle.norms) {
      const created = await prisma.norm.create({
        data: {
          tenantId: tenant.id,
          typeId: typeMap.get(norm.type) ?? null,
          statusId: statusMap.get(norm.status) ?? null,
          type: norm.type,
          number: norm.number,
          year: norm.year,
          fullCode: norm.fullCode,
          title: norm.title,
          summary: norm.summary,
          plainLanguageSummary: norm.plainLanguageSummary,
          fullText: norm.fullText,
          publicationDate: new Date(norm.publicationDate),
          effectiveDate: new Date(norm.effectiveDate),
          lifecycleStatusCode: norm.status,
          classification: norm.classification,
          subject: norm.subject,
          authorship: norm.authorship,
          initiative: norm.initiative,
          sourceUrl: norm.sourceUrl,
          pdfUrl: norm.pdfUrl,
          accessCount: norm.accessCount,
          keywords: norm.keywords,
          changeHistory: norm.changeHistory
        }
      });

      normMap.set(norm.id, created.id);

      for (const themeId of norm.themeIds) {
        const resolvedThemeId = themeMap.get(themeId);
        if (resolvedThemeId) {
          await prisma.normThemeAssignment.create({
            data: {
              normId: created.id,
              themeId: resolvedThemeId
            }
          });
        }
      }

      for (const attachment of norm.attachments) {
        await prisma.normAttachment.create({
          data: {
            tenantId: tenant.id,
            normId: created.id,
            title: attachment.title,
            url: attachment.url,
            kind: attachment.kind
          }
        });
      }

      for (const change of norm.changeHistory) {
        await prisma.normStatusHistory.create({
          data: {
            normId: created.id,
            statusCode: norm.status,
            notes: change
          }
        });
      }
    }

    for (const norm of bundle.norms) {
      for (const relation of norm.relationships) {
        const normId = normMap.get(norm.id);
        const relatedNormId = normMap.get(relation.relatedNormId);

        if (normId && relatedNormId) {
          await prisma.normRelationship.create({
            data: {
              tenantId: tenant.id,
              normId,
              relatedNormId,
              relationType: relation.relationType.replace("-", "_") as
                | "altera"
                | "regulamenta"
                | "revoga_parcialmente"
                | "complementa",
              label: relation.label
            }
          });
        }
      }
    }

    for (const item of bundle.featuredNorms) {
      const normId = normMap.get(item.normId);
      if (normId) {
        await prisma.featuredNorm.create({
          data: {
            tenantId: tenant.id,
            normId,
            highlightText: item.highlightText,
            order: item.order
          }
        });
      }
    }
  }

  const userMap = new Map<string, string>();
  for (const user of demoUsers) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.password
      }
    });
    userMap.set(user.email, created.id);

    const roleId = roleMap.get(user.role);
    if (roleId) {
      await prisma.userRole.create({
        data: {
          userId: created.id,
          roleId,
          tenantId: user.tenantSlug ? tenantIdBySlug.get(user.tenantSlug) : null
        }
      });
    }
  }

  const piracicabaTenantId = tenantIdBySlug.get("piracicaba-sp");
  const globalAdminId = userMap.get("admin@legislacaodigital.dev");

  if (piracicabaTenantId && globalAdminId) {
    await prisma.notificationSubscription.create({
      data: {
        tenantId: piracicabaTenantId,
        userId: globalAdminId,
        email: "admin@legislacaodigital.dev",
        query: "tributacao digital"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
