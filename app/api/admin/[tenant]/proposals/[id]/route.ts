import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { proposalUpdateSchema } from "@/features/admin/admin.schemas";
import { getProposalById, updateProposalDraft } from "@/server/editorial/editorial-service";

export async function GET(_request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const proposal = await getProposalById(id);

  if (!proposal) {
    return NextResponse.json({ message: "Proposta não encontrada." }, { status: 404 });
  }

  return NextResponse.json(proposal);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const parsed = proposalUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload inválido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const proposal = await updateProposalDraft(id, parsed.data, session.user.email!);
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao atualizar." },
      { status: 400 }
    );
  }
}
