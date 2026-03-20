import { describe, test, expect, beforeEach } from "vitest";

// Reset the memory store before each test
beforeEach(() => {
  // @ts-expect-error -- Reset the global store for clean test state
  globalThis.__legislacaoDigitalStore = undefined;
});

describe("Editorial workflow — proposal lifecycle", () => {
  test("create proposal returns a draft", async () => {
    const { createProposal } = await import("@/server/editorial/editorial-service");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Nova redação do art. 2",
        description: "Ajuste na notificação eletrônica",
        proposedFullText: "Art. 1 Texto original.\n\nArt. 2 Texto com nova redação.",
        changeEvents: [
          {
            target: "Art. 2",
            changeType: "nova-redacao",
            beforeText: "Art. 2 Texto anterior.",
            afterText: "Art. 2 Texto com nova redação."
          }
        ]
      },
      "admin@piracicaba.gov.br"
    );

    expect(proposal.status).toBe("draft");
    expect(proposal.normId).toBe("piracicaba-lc-405");
    expect(proposal.authorEmail).toBe("admin@piracicaba.gov.br");
    expect(proposal.changeEvents).toHaveLength(1);
    expect(proposal.currentFullTextSnapshot).toBeTruthy();
  });

  test("submit for review changes status to pending_review", async () => {
    const { createProposal, submitForReview } = await import("@/server/editorial/editorial-service");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Acréscimo do art. 3-B",
        description: "Novo dispositivo sobre protocolo digital",
        proposedFullText: "Art. 1 ...\n\nArt. 3-B Novo dispositivo.",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    const submitted = await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    expect(submitted.status).toBe("pending_review");
  });

  test("cannot submit a non-draft proposal", async () => {
    const { createProposal, submitForReview } = await import("@/server/editorial/editorial-service");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Test",
        description: "Test submission",
        proposedFullText: "Art. 1 Conteudo de teste para validacao.",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    await expect(submitForReview(proposal.id, "admin@piracicaba.gov.br")).rejects.toThrow();
  });

  test("approve proposal sets status and records reviewer", async () => {
    const { createProposal, submitForReview, approveProposal } = await import("@/server/editorial/editorial-service");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Alteração art. 4",
        description: "Regulamentação complementar",
        proposedFullText: "Art. 1 ...\n\nArt. 4 Nova redação.",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    const approved = await approveProposal(proposal.id, "superadmin@legislacao.com.br", "Redação aprovada.");

    expect(approved.status).toBe("approved");
    expect(approved.reviewerEmail).toBe("superadmin@legislacao.com.br");
    expect(approved.reviewComment).toBe("Redação aprovada.");
    expect(approved.reviewedAt).toBeTruthy();
  });

  test("reject proposal keeps norm text unchanged", async () => {
    const { createProposal, submitForReview, rejectProposal } = await import("@/server/editorial/editorial-service");
    const { getNormById, getCurrentNormText } = await import("@/server/norms/norm-service");

    const normBefore = await getNormById("piracicaba-sp", "piracicaba-lc-405");
    const textBefore = getCurrentNormText(normBefore!);

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Mudança art. 5",
        description: "Teste de rejeição",
        proposedFullText: "TEXTO COMPLETAMENTE DIFERENTE",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    const rejected = await rejectProposal(proposal.id, "superadmin@legislacao.com.br", "Texto inadequado.");

    expect(rejected.status).toBe("rejected");

    const normAfter = await getNormById("piracicaba-sp", "piracicaba-lc-405");
    const textAfter = getCurrentNormText(normAfter!);
    expect(textAfter).toBe(textBefore);
  });

  test("publish proposal updates norm text, creates version and change events", async () => {
    const { createProposal, submitForReview, approveProposal, publishProposal } = await import("@/server/editorial/editorial-service");
    const { getNormById, getCurrentNormText, getNormTextVersions, getNormChangeEvents } = await import("@/server/norms/norm-service");

    const normBefore = await getNormById("piracicaba-sp", "piracicaba-lc-405");
    const textBefore = getCurrentNormText(normBefore!);
    const versionsBefore = getNormTextVersions(normBefore!);
    const eventsBefore = getNormChangeEvents(normBefore!);

    const newText = textBefore.replace(
      "Art. 2 As notificacoes poderao ser expedidas por meio eletronico",
      "Art. 2 As notificacoes DEVERAO ser expedidas EXCLUSIVAMENTE por meio eletronico"
    );

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        sourceNormId: "piracicaba-lc-418",
        title: "Nova redação do art. 2 da LC 405",
        description: "Tornando a notificação exclusivamente digital",
        proposedFullText: newText,
        changeEvents: [
          {
            target: "Art. 2",
            changeType: "nova-redacao",
            beforeText: "As notificacoes poderao ser expedidas por meio eletronico",
            afterText: "As notificacoes DEVERAO ser expedidas EXCLUSIVAMENTE por meio eletronico"
          }
        ]
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    await approveProposal(proposal.id, "superadmin@legislacao.com.br", "Aprovado.");
    const published = await publishProposal(proposal.id, "superadmin@legislacao.com.br");

    // 1. Proposal marked as published
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeTruthy();

    // 2. Norm text updated
    const normAfter = await getNormById("piracicaba-sp", "piracicaba-lc-405");
    const textAfter = getCurrentNormText(normAfter!);
    expect(textAfter).toContain("DEVERAO ser expedidas EXCLUSIVAMENTE");
    expect(textAfter).not.toBe(textBefore);

    // 3. New versions created (historical + consolidated)
    const versionsAfter = getNormTextVersions(normAfter!);
    expect(versionsAfter.length).toBeGreaterThan(versionsBefore.length);

    const currentVersion = versionsAfter.find((v) => v.isCurrent);
    expect(currentVersion).toBeTruthy();
    expect(currentVersion?.kind).toBe("consolidada");

    // 4. Change events created
    const eventsAfter = getNormChangeEvents(normAfter!);
    expect(eventsAfter.length).toBeGreaterThan(eventsBefore.length);

    const newEvent = eventsAfter.find((e) => e.target === "Art. 2" && e.afterText?.includes("EXCLUSIVAMENTE"));
    expect(newEvent).toBeTruthy();
    expect(newEvent?.sourceNormId).toBe("piracicaba-lc-418");
  });

  test("cannot publish a non-approved proposal", async () => {
    const { createProposal, submitForReview, publishProposal } = await import("@/server/editorial/editorial-service");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Test publish guard",
        description: "Should fail to publish directly",
        proposedFullText: "Art. 1 Texto qualquer para teste.",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    await expect(publishProposal(proposal.id, "superadmin@legislacao.com.br")).rejects.toThrow(
      "Só é possível publicar propostas aprovadas."
    );
  });

  test("audit logs are created for each action", async () => {
    const { createProposal, submitForReview, approveProposal, publishProposal } = await import("@/server/editorial/editorial-service");
    const { getMemoryStore } = await import("@/server/data/memory-store");

    const proposal = await createProposal(
      "piracicaba-sp",
      {
        normId: "piracicaba-lc-405",
        title: "Audit test",
        description: "Verificar registros de auditoria",
        proposedFullText: "Art. 1 Texto para auditoria de teste.",
        changeEvents: []
      },
      "admin@piracicaba.gov.br"
    );

    await submitForReview(proposal.id, "admin@piracicaba.gov.br");
    await approveProposal(proposal.id, "superadmin@legislacao.com.br", "OK.");
    await publishProposal(proposal.id, "superadmin@legislacao.com.br");

    const store = getMemoryStore();
    const relatedLogs = store.auditLogs.filter((log) => log.targetId === proposal.id);

    // created, submitted, approved, published = 4 proposal audit logs
    expect(relatedLogs.length).toBe(4);
    expect(relatedLogs.map((l) => l.action)).toEqual(
      expect.arrayContaining([
        "proposal.created",
        "proposal.submitted",
        "proposal.approved",
        "proposal.published"
      ])
    );
  });
});
