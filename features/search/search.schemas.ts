import { z } from "zod";

export const searchFormSchema = z.object({
  query: z.string().trim().optional().default(""),
  number: z.string().trim().optional().default(""),
  year: z.string().trim().optional().default(""),
  type: z.string().trim().optional().default(""),
  theme: z.string().trim().optional().default(""),
  classification: z.string().trim().optional().default(""),
  authorship: z.string().trim().optional().default(""),
  initiative: z.string().trim().optional().default(""),
  status: z.string().trim().optional().default(""),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
  sort: z.enum(["relevance", "recent", "popular"]).optional().default("relevance")
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
