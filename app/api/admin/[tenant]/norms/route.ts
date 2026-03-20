import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { normUpsertSchema } from "@/features/admin/admin.schemas";
import { upsertNorm } from "@/server/admin/admin-service";

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  const { tenant } = await params;

  if (!session?.user || (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant)) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const parsed = normUpsertSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const norm = await upsertNorm(tenant, parsed.data);
    return NextResponse.json(norm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Falha ao salvar norma." }, { status: 400 });
  }
}
