import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { proposalCreateSchema } from "@/features/admin/admin.schemas";
import { createProposal, getProposalsByTenant } from "@/server/editorial/editorial-service";
import { type ProposalStatus } from "@/types/domain";

export async function GET(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  const { tenant } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as ProposalStatus | null;
  const authorFilter = session.user.role === "GLOBAL_ADMIN" ? undefined : session.user.email!;

  const proposals = await getProposalsByTenant(tenant, {
    status: status ?? undefined,
    authorEmail: authorFilter
  });

  return NextResponse.json(proposals);
}

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  const { tenant } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const parsed = proposalCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload inválido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const proposal = await createProposal(tenant, parsed.data, session.user.email!);
    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao criar proposta." },
      { status: 400 }
    );
  }
}
