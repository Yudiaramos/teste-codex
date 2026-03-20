import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateTenant } from "@/server/admin/admin-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "GLOBAL_ADMIN") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;

  try {
    const tenant = await updateTenant(id, payload as never);
    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Falha ao atualizar tenant." }, { status: 400 });
  }
}
