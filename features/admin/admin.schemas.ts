import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  stateCode: z.string().min(2).max(2),
  primaryColor: z.string().min(4),
  secondaryColor: z.string().min(4),
  accentColor: z.string().min(4),
  logoUrl: z.string().url().optional().or(z.literal(""))
});

export const normUpsertSchema = z.object({
  title: z.string().min(5),
  summary: z.string().min(10),
  plainLanguageSummary: z.string().min(10),
  type: z.string().min(2),
  number: z.string().min(1),
  year: z.coerce.number().int().min(1900),
  status: z.enum(["vigente", "revogada", "alterada", "historica"]),
  classification: z.string().min(2)
});

export const proposalChangeEventSchema = z.object({
  target: z.string().min(1),
  changeType: z.enum(["nova-redacao", "acrescimo", "revogacao", "consolidacao", "regulamentacao"]),
  beforeText: z.string(),
  afterText: z.string(),
  notes: z.string().optional()
});

export const proposalCreateSchema = z.object({
  normId: z.string().min(1),
  sourceNormId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  proposedFullText: z.string().min(10),
  changeEvents: z.array(proposalChangeEventSchema).default([])
});

export const proposalUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  proposedFullText: z.string().min(10).optional(),
  changeEvents: z.array(proposalChangeEventSchema).optional()
});

export const proposalReviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().min(1, "O comentário é obrigatório.")
});

