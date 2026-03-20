export type TenantLayoutMode = "shared" | "municipal-spotlight";

export type NormStatusCode = "vigente" | "revogada" | "alterada" | "historica";

export type UserRoleCode = "GLOBAL_ADMIN" | "TENANT_ADMIN" | "CITIZEN";

export type NormChangeKind =
  | "nova-redacao"
  | "acrescimo"
  | "revogacao"
  | "consolidacao"
  | "regulamentacao";

export type NormVersionKind = "original" | "alterada" | "consolidada" | "vigente";

export type ProposalStatus = "draft" | "pending_review" | "approved" | "rejected" | "published";

export interface ProposalChangeEvent {
  target: string;
  changeType: NormChangeKind;
  beforeText: string;
  afterText: string;
  notes?: string;
}

export interface EditorialProposal {
  id: string;
  tenantId: string;
  normId: string;
  sourceNormId?: string;
  authorEmail: string;
  status: ProposalStatus;
  title: string;
  description: string;
  proposedFullText: string;
  currentFullTextSnapshot: string;
  changeEvents: ProposalChangeEvent[];
  reviewerEmail?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
}

export interface TenantBranding {
  logoUrl: string;
  crestUrl: string;
  heroImageUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    surface: string;
    foreground: string;
  };
}

export interface HomeShortcut {
  title: string;
  description: string;
  href: string;
}

export interface HomeSection {
  key:
    | "featured"
    | "most-accessed"
    | "recent"
    | "themes"
    | "how-to-search"
    | "stats"
    | "notice";
  title: string;
  description: string;
}

export interface MunicipalityProfile {
  cityName: string;
  stateCode: string;
  officialHeadline: string;
  institutionalText: string;
  howToSearch: string[];
  strategicShortcuts: HomeShortcut[];
  homeSections: HomeSection[];
  notices: string[];
}

export interface TenantTheme {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  popularity: number;
}

export interface NormType {
  id: string;
  tenantId: string;
  code: string;
  label: string;
}

export interface NormStatus {
  id: string;
  tenantId: string;
  code: NormStatusCode;
  label: string;
  description: string;
}

export interface NormAttachment {
  id: string;
  normId: string;
  tenantId: string;
  title: string;
  url: string;
  kind: "pdf" | "annex" | "guide";
}

export interface NormRelationship {
  id: string;
  normId: string;
  tenantId: string;
  relatedNormId: string;
  relationType: "altera" | "regulamenta" | "revoga-parcialmente" | "complementa";
  label: string;
}

export interface NormTextVersion {
  id: string;
  normId: string;
  tenantId: string;
  label: string;
  kind: NormVersionKind;
  validFrom: string;
  validTo?: string;
  sourceNormId?: string;
  summary: string;
  fullText: string;
  plainLanguageSummary?: string;
  isCurrent?: boolean;
}

export interface NormChangeEvent {
  id: string;
  normId: string;
  tenantId: string;
  kind: NormChangeKind;
  effectiveDate: string;
  target: string;
  summary: string;
  sourceNormId?: string;
  sourceNormCode?: string;
  beforeText?: string;
  afterText?: string;
  notes?: string;
  order: number;
}

export interface NormRecord {
  id: string;
  tenantId: string;
  type: string;
  typeLabel: string;
  number: string;
  year: number;
  fullCode: string;
  title: string;
  summary: string;
  plainLanguageSummary: string;
  fullText: string;
  publicationDate: string;
  effectiveDate: string;
  status: NormStatusCode;
  classification: string;
  subject: string;
  authorship: string;
  initiative: string;
  sourceUrl: string;
  pdfUrl: string;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  themeIds: string[];
  keywords: string[];
  tags: string[];
  attachments: NormAttachment[];
  relationships: NormRelationship[];
  changeHistory: string[];
  textVersions?: NormTextVersion[];
  changeEvents?: NormChangeEvent[];
  isStrategic?: boolean;
}

export interface FeaturedNorm {
  id: string;
  tenantId: string;
  normId: string;
  highlightText: string;
  order: number;
}

export interface SearchLogEntry {
  id: string;
  tenantId: string;
  query: string;
  filters: Record<string, string>;
  createdAt: string;
}

export interface FavoriteNormEntry {
  id: string;
  tenantId: string;
  userEmail: string;
  normId: string;
  createdAt: string;
}

export interface NotificationSubscriptionEntry {
  id: string;
  tenantId: string;
  email: string;
  query: string;
  createdAt: string;
}

export interface AdminAuditLogEntry {
  id: string;
  tenantId?: string;
  userEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRoleCode;
  tenantSlug?: string;
}

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  stateCode: string;
  layoutMode: TenantLayoutMode;
  branding: TenantBranding;
  profile: MunicipalityProfile;
  popularThemeIds: string[];
  highlightedNormIds: string[];
  recentNormIds: string[];
  mostAccessedNormIds: string[];
  stats: {
    publishedNorms: number;
    monthlySearches: number;
    updatedThisYear: number;
  };
}

export interface SearchFilters {
  query?: string;
  number?: string;
  year?: number;
  type?: string;
  theme?: string;
  classification?: string;
  authorship?: string;
  initiative?: string;
  status?: NormStatusCode;
  dateFrom?: string;
  dateTo?: string;
  sort?: "relevance" | "recent" | "popular";
}

export interface SearchResult {
  items: NormRecord[];
  total: number;
  suggestions: string[];
  popularQueries: string[];
}

export interface TenantBundle {
  tenant: TenantRecord;
  themes: TenantTheme[];
  normTypes: NormType[];
  normStatuses: NormStatus[];
  norms: NormRecord[];
  featuredNorms: FeaturedNorm[];
}
