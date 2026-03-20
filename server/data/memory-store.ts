import { demoBundles, demoUsers } from "@/server/data/demo-content";
import {
  type AdminAuditLogEntry,
  type EditorialProposal,
  type FavoriteNormEntry,
  type NotificationSubscriptionEntry,
  type SearchLogEntry,
  type TenantBundle
} from "@/types/domain";

interface MemoryStore {
  bundles: TenantBundle[];
  searchLogs: SearchLogEntry[];
  favorites: FavoriteNormEntry[];
  notifications: NotificationSubscriptionEntry[];
  auditLogs: AdminAuditLogEntry[];
  proposals: EditorialProposal[];
  users: typeof demoUsers;
}

function cloneBundles() {
  return structuredClone(demoBundles);
}

declare global {
  // eslint-disable-next-line no-var
  var __legislacaoDigitalStore: MemoryStore | undefined;
}

export function getMemoryStore(): MemoryStore {
  if (!globalThis.__legislacaoDigitalStore) {
    globalThis.__legislacaoDigitalStore = {
      bundles: cloneBundles(),
      searchLogs: [],
      favorites: [],
      notifications: [],
      auditLogs: [],
      proposals: [],
      users: structuredClone(demoUsers)
    };
  }

  // Migration: ensure proposals array exists on stores initialized before the editorial workflow
  if (!globalThis.__legislacaoDigitalStore.proposals) {
    globalThis.__legislacaoDigitalStore.proposals = [];
  }

  return globalThis.__legislacaoDigitalStore;
}
