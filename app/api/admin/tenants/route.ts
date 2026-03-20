import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { tenantUpdateSchema } from "@/features/admin/admin.schemas";
import { createTenant } from "@/server/admin/admin-service";

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "GLOBAL_ADMIN") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const parsed = tenantUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const tenant = await createTenant(parsed.data);
  return NextResponse.json(tenant, { status: 201 });
}
