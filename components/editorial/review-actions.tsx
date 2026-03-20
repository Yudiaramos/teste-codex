"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ReviewActionsProps {
  tenantSlug: string;
  proposalId: string;
  proposalStatus: string;
  userRole: string;
}

export function ReviewActions({ tenantSlug, proposalId, proposalStatus, userRole }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isGlobalAdmin = userRole === "GLOBAL_ADMIN";

  async function handleReview(decision: "approved" | "rejected") {
    if (!comment.trim()) {
      setError("O comentário é obrigatório.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/${tenantSlug}/proposals/${proposalId}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, comment })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }

        setSuccess(decision === "approved" ? "Proposta aprovada!" : "Proposta rejeitada.");
        setTimeout(() => router.refresh(), 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  async function handlePublish() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/${tenantSlug}/proposals/${proposalId}/publish`, {
          method: "POST"
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }

        setSuccess("Publicada com sucesso! O texto público foi atualizado.");
        setTimeout(() => router.refresh(), 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {/* Review actions (only for pending_review + GLOBAL_ADMIN) */}
      {proposalStatus === "pending_review" && isGlobalAdmin && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Comentário do revisor
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Justificativa para aprovação ou rejeição..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleReview("approved")}
              disabled={isPending}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.97] disabled:opacity-40"
            >
              {isPending ? "Processando..." : "✓ Aprovar"}
            </button>
            <button
              type="button"
              onClick={() => handleReview("rejected")}
              disabled={isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-500 active:scale-[0.97] disabled:opacity-40"
            >
              {isPending ? "Processando..." : "✗ Rejeitar"}
            </button>
          </div>
        </div>
      )}

      {/* Publish action (only for approved + GLOBAL_ADMIN) */}
      {proposalStatus === "approved" && isGlobalAdmin && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="rounded-2xl bg-gradient-to-r from-[var(--tenant-primary)] to-[#138a9f] px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
        >
          {isPending ? "Publicando..." : "🚀 Publicar no portal público"}
        </button>
      )}
    </div>
  );
}
