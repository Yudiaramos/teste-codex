import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { publishProposal } from "@/server/editorial/editorial-service";

export async function POST(_request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || session.user.role !== "GLOBAL_ADMIN") {
    return NextResponse.json({ message: "Apenas super admin pode publicar." }, { status: 403 });
  }

  try {
    const proposal = await publishProposal(id, session.user.email!);
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao publicar." },
      { status: 400 }
    );
  }
}
