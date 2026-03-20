import { NextResponse } from "next/server";

import { getTenants } from "@/server/tenants/tenant-service";

export async function GET() {
  const tenants = await getTenants();
  return NextResponse.json({ items: tenants });
}
