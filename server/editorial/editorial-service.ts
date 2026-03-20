import { getMemoryStore } from "@/server/data/memory-store";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import { getCurrentNormText } from "@/server/norms/norm-service";
import {
  type EditorialProposal,
  type NormChangeEvent,
  type NormTextVersion,
  type ProposalChangeEvent,
  type ProposalStatus
} from "@/types/domain";

function generateId() {
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addAuditLog(tenantId: string, userEmail: string, action: string, targetType: string, targetId: string) {
  const store = getMemoryStore();
  store.auditLogs.push({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tenantId,
    userEmail,
    action,
    targetType,
    targetId,
    createdAt: new Date().toISOString()
  });
}

// ── Create ──

export async function createProposal(
  tenantSlug: string,
  input: {
    normId: string;
    sourceNormId?: string;
    title: string;
    description: string;
    proposedFullText: string;
    changeEvents: ProposalChangeEvent[];
  },
  authorEmail: string
): Promise<EditorialProposal> {
  const bundle = await getTenantBundleBySlug(tenantSlug);
  if (!bundle) throw new Error("Tenant não encontrado.");

  const norm = bundle.norms.find((n) => n.id === input.normId);
  if (!norm) throw new Error("Norma não encontrada.");

  const store = getMemoryStore();
  const now = new Date().toISOString();

  const proposal: EditorialProposal = {
    id: generateId(),
    tenantId: bundle.tenant.id,
    normId: input.normId,
    sourceNormId: input.sourceNormId,
    authorEmail,
    status: "draft",
    title: input.title,
    description: input.description,
    proposedFullText: input.proposedFullText,
    currentFullTextSnapshot: getCurrentNormText(norm),
    changeEvents: input.changeEvents,
    createdAt: now,
    updatedAt: now
  };

  store.proposals.push(proposal);
  addAuditLog(bundle.tenant.id, authorEmail, "proposal.created", "proposal", proposal.id);

  return proposal;
}

// ── Update draft ──

export async function updateProposalDraft(
  proposalId: string,
  input: {
    title?: string;
    description?: string;
    proposedFullText?: string;
    changeEvents?: ProposalChangeEvent[];
  },
  authorEmail: string
): Promise<EditorialProposal> {
  const store = getMemoryStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "draft") throw new Error("Só é possível editar propostas em rascunho.");
  if (proposal.authorEmail !== authorEmail) throw new Error("Somente o autor pode editar o rascunho.");

  if (input.title !== undefined) proposal.title = input.title;
  if (input.description !== undefined) proposal.description = input.description;
  if (input.proposedFullText !== undefined) proposal.proposedFullText = input.proposedFullText;
  if (input.changeEvents !== undefined) proposal.changeEvents = input.changeEvents;
  proposal.updatedAt = new Date().toISOString();

  return proposal;
}

// ── Submit for review ──

export async function submitForReview(proposalId: string, authorEmail: string): Promise<EditorialProposal> {
  const store = getMemoryStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "draft") throw new Error("Só é possível submeter propostas em rascunho.");
  if (proposal.authorEmail !== authorEmail) throw new Error("Somente o autor pode submeter para revisão.");

  proposal.status = "pending_review";
  proposal.updatedAt = new Date().toISOString();

  addAuditLog(proposal.tenantId, authorEmail, "proposal.submitted", "proposal", proposal.id);

  return proposal;
}

// ── List ──

export async function getProposalsByTenant(
  tenantSlug: string,
  filters?: { status?: ProposalStatus; authorEmail?: string }
): Promise<EditorialProposal[]> {
  const bundle = await getTenantBundleBySlug(tenantSlug);
  if (!bundle) return [];

  const store = getMemoryStore();
  let proposals = store.proposals.filter((p) => p.tenantId === bundle.tenant.id);

  if (filters?.status) {
    proposals = proposals.filter((p) => p.status === filters.status);
  }

  if (filters?.authorEmail) {
    proposals = proposals.filter((p) => p.authorEmail === filters.authorEmail);
  }

  return proposals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPendingReviewProposals(tenantSlug: string): Promise<EditorialProposal[]> {
  return getProposalsByTenant(tenantSlug, { status: "pending_review" });
}

// ── Detail ──

export async function getProposalById(proposalId: string): Promise<EditorialProposal | null> {
  const store = getMemoryStore();
  return store.proposals.find((p) => p.id === proposalId) ?? null;
}

// ── Review (GLOBAL_ADMIN only) ──

export async function approveProposal(
  proposalId: string,
  reviewerEmail: string,
  comment: string
): Promise<EditorialProposal> {
  const store = getMemoryStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "pending_review") throw new Error("Proposta não está em revisão.");

  const now = new Date().toISOString();
  proposal.status = "approved";
  proposal.reviewerEmail = reviewerEmail;
  proposal.reviewComment = comment;
  proposal.reviewedAt = now;
  proposal.updatedAt = now;

  addAuditLog(proposal.tenantId, reviewerEmail, "proposal.approved", "proposal", proposal.id);

  return proposal;
}

export async function rejectProposal(
  proposalId: string,
  reviewerEmail: string,
  comment: string
): Promise<EditorialProposal> {
  const store = getMemoryStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "pending_review") throw new Error("Proposta não está em revisão.");

  const now = new Date().toISOString();
  proposal.status = "rejected";
  proposal.reviewerEmail = reviewerEmail;
  proposal.reviewComment = comment;
  proposal.reviewedAt = now;
  proposal.updatedAt = now;

  addAuditLog(proposal.tenantId, reviewerEmail, "proposal.rejected", "proposal", proposal.id);

  return proposal;
}

// ── Publish (GLOBAL_ADMIN only, status must be approved) ──

export async function publishProposal(
  proposalId: string,
  publisherEmail: string
): Promise<EditorialProposal> {
  const store = getMemoryStore();
  const proposal = store.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "approved") throw new Error("Só é possível publicar propostas aprovadas.");

  // Find the norm in the bundle
  const bundle = store.bundles.find((b) => b.tenant.id === proposal.tenantId);
  if (!bundle) throw new Error("Tenant não encontrado.");

  const norm = bundle.norms.find((n) => n.id === proposal.normId);
  if (!norm) throw new Error("Norma não encontrada.");

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // 1. Save the current text as a historical version
  const previousVersionId = `ver-${Date.now()}-prev`;
  const previousVersion: NormTextVersion = {
    id: previousVersionId,
    normId: norm.id,
    tenantId: proposal.tenantId,
    label: `Versão antes de: ${proposal.title}`,
    kind: "alterada",
    validFrom: norm.effectiveDate,
    validTo: today,
    summary: `Texto vigente até ${today}, antes da aplicação: ${proposal.title}`,
    fullText: proposal.currentFullTextSnapshot,
    isCurrent: false
  };

  // 2. Create new consolidated version
  const newVersionId = `ver-${Date.now()}-new`;
  const newVersion: NormTextVersion = {
    id: newVersionId,
    normId: norm.id,
    tenantId: proposal.tenantId,
    label: proposal.title,
    kind: "consolidada",
    validFrom: today,
    sourceNormId: proposal.sourceNormId,
    summary: proposal.description,
    fullText: proposal.proposedFullText,
    isCurrent: true
  };

  // Mark all existing versions as not current
  if (!norm.textVersions) norm.textVersions = [];
  norm.textVersions.forEach((v) => { v.isCurrent = false; });

  // Add new versions
  norm.textVersions.push(previousVersion, newVersion);

  // 3. Create change events for each altered device
  if (!norm.changeEvents) norm.changeEvents = [];
  const baseOrder = norm.changeEvents.length;

  proposal.changeEvents.forEach((ce, index) => {
    const changeEvent: NormChangeEvent = {
      id: `ce-${Date.now()}-${index}`,
      normId: norm.id,
      tenantId: proposal.tenantId,
      kind: ce.changeType,
      effectiveDate: today,
      target: ce.target,
      summary: `${ce.changeType.replace("-", " ")} — ${ce.target}`,
      sourceNormId: proposal.sourceNormId,
      beforeText: ce.beforeText,
      afterText: ce.afterText,
      notes: ce.notes,
      order: baseOrder + index + 1
    };
    norm.changeEvents!.push(changeEvent);
  });

  // 4. Update the norm's consolidated text
  norm.fullText = proposal.proposedFullText;
  norm.updatedAt = now;
  norm.changeHistory.push(`${proposal.title} — publicado em ${today} por ${publisherEmail}.`);

  // 5. Mark proposal as published
  proposal.status = "published";
  proposal.publishedAt = now;
  proposal.updatedAt = now;

  addAuditLog(proposal.tenantId, publisherEmail, "proposal.published", "proposal", proposal.id);
  addAuditLog(proposal.tenantId, publisherEmail, "norm.text_updated", "norm", norm.id);

  return proposal;
}

// ── Count helpers for dashboard ──

export async function getProposalCounts(tenantSlug: string) {
  const bundle = await getTenantBundleBySlug(tenantSlug);
  if (!bundle) return { draft: 0, pendingReview: 0, approved: 0, rejected: 0, published: 0 };

  const store = getMemoryStore();
  const proposals = store.proposals.filter((p) => p.tenantId === bundle.tenant.id);

  return {
    draft: proposals.filter((p) => p.status === "draft").length,
    pendingReview: proposals.filter((p) => p.status === "pending_review").length,
    approved: proposals.filter((p) => p.status === "approved").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
    published: proposals.filter((p) => p.status === "published").length
  };
}
