import { NextResponse } from "next/server";

import { ingestText } from "@/server/ingestion/pdf-ingestion-service";

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawText = formData.get("rawText") as string | null;
    const uploaderEmail = (formData.get("uploaderEmail") as string) ?? "system@ingest";

    let textContent: string;

    if (rawText) {
      textContent = rawText;
    } else if (file) {
      // For now, read file as text. In production, use a PDF parser library.
      textContent = await file.text();
    } else {
      return NextResponse.json(
        { error: "No file or rawText provided" },
        { status: 400 }
      );
    }

    if (textContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty content" },
        { status: 400 }
      );
    }

    const result = await ingestText(tenant, textContent, uploaderEmail);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
