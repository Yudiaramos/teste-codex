import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { proposalReviewSchema } from "@/features/admin/admin.schemas";
import { approveProposal, rejectProposal } from "@/server/editorial/editorial-service";

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || session.user.role !== "GLOBAL_ADMIN") {
    return NextResponse.json({ message: "Apenas super admin pode revisar propostas." }, { status: 403 });
  }

  const parsed = proposalReviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload inválido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const handler = parsed.data.decision === "approved" ? approveProposal : rejectProposal;
    const proposal = await handler(id, session.user.email!, parsed.data.comment);
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha na revisão." },
      { status: 400 }
    );
  }
}
