import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { submitForReview } from "@/server/editorial/editorial-service";

export async function POST(_request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  try {
    const proposal = await submitForReview(id, session.user.email!);
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao submeter." },
      { status: 400 }
    );
  }
}
