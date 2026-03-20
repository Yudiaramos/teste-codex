import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProposalsByTenant, getProposalCounts } from "@/server/editorial/editorial-service";
import { formatDate } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  pending_review: { label: "Aguardando revisão", color: "bg-amber-100 text-amber-800" },
  approved: { label: "Aprovada", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejeitada", color: "bg-rose-100 text-rose-800" },
  published: { label: "Publicada", color: "bg-emerald-100 text-emerald-800" }
};

export default async function PropostasPage({ params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { tenant } = await params;

  if (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant) {
    redirect("/admin");
  }

  const proposals = await getProposalsByTenant(tenant);
  const counts = await getProposalCounts(tenant);

  return (
    <main className="page-shell py-10">
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <span className="section-eyebrow">Fluxo editorial</span>
          <h1 className="text-5xl">Propostas de alteração</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Crie, acompanhe e revise propostas antes de publicá-las no portal público.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`/admin/${tenant}/editor`}>+ Nova proposta</Link>
        </Button>
      </section>

      {/* Counts */}
      <section className="mb-8 grid gap-4 md:grid-cols-5">
        {Object.entries(counts).map(([key, count]) => {
          const statusKey = key === "pendingReview" ? "pending_review" : key;
          const info = statusLabels[statusKey] ?? { label: key, color: "bg-slate-100 text-slate-700" };
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardDescription>{info.label}</CardDescription>
                <CardTitle className="text-4xl">{count}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Proposals list */}
      <section className="space-y-4">
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhuma proposta encontrada. Crie a primeira!
            </CardContent>
          </Card>
        ) : null}

        {proposals.map((proposal) => {
          const info = statusLabels[proposal.status] ?? { label: proposal.status, color: "bg-slate-100 text-slate-700" };

          return (
            <Card key={proposal.id} className="card-hover">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${info.color}`}>
                    {info.label}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(proposal.updatedAt)}</span>
                </div>
                <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                <CardDescription>{proposal.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">
                  Por <strong>{proposal.authorEmail}</strong>
                </span>
                {proposal.changeEvents.length > 0 && (
                  <span className="text-sm text-slate-500">
                    • {proposal.changeEvents.length} dispositivo(s) alterado(s)
                  </span>
                )}
                <div className="flex-1" />
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/${tenant}/propostas/${proposal.id}`}>
                    {proposal.status === "pending_review" && session.user.role === "GLOBAL_ADMIN"
                      ? "Revisar"
                      : "Ver detalhes"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
