import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { EditorNormSelector } from "@/components/editorial/editor-norm-selector";
import { getCurrentNormText, getNormsByTenant } from "@/server/norms/norm-service";

export default async function EditorPage({ params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { tenant } = await params;

  if (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant) {
    return notFound();
  }

  const norms = await getNormsByTenant(tenant);

  return (
    <main className="page-shell py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar ao painel
        </Link>
      </Button>

      <section className="mb-8 space-y-3">
        <span className="section-eyebrow">Editor Legislativo</span>
        <h1 className="text-5xl">Nova proposta de alteração</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Edite o texto, registre os dispositivos alterados e envie para revisão do super admin.
        </p>
      </section>

      {norms.length === 0 ? (
        <p className="text-slate-600">Nenhuma norma cadastrada neste tenant.</p>
      ) : (
        <EditorNormSelector
          tenantSlug={tenant}
          norms={norms.map((n) => ({ id: n.id, fullCode: n.fullCode, fullText: getCurrentNormText(n) }))}
        />
      )}
    </main>
  );
}
