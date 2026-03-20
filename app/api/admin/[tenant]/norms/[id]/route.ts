import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateNormById } from "@/server/admin/admin-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const session = await auth();
  const { tenant, id } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;

  try {
    const norm = await updateNormById(tenant, id, payload as never);
    return NextResponse.json(norm);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Falha ao atualizar norma." }, { status: 400 });
  }
}
