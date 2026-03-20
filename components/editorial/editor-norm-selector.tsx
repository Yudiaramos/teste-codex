"use client";

import { useState } from "react";
import { EditorForm } from "@/components/editorial/editor-form";

interface NormOption {
  id: string;
  fullCode: string;
  fullText: string;
}

export function EditorNormSelector({ tenantSlug, norms }: { tenantSlug: string; norms: NormOption[] }) {
  const [selectedNormId, setSelectedNormId] = useState<string | null>(null);
  const selectedNorm = norms.find((n) => n.id === selectedNormId);

  if (!selectedNormId || !selectedNorm) {
    return (
      <div className="rounded-[2rem] border border-slate-200 p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Selecione a norma para editar</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {norms.map((norm) => (
            <button
              key={norm.id}
              onClick={() => setSelectedNormId(norm.id)}
              className="group rounded-2xl border border-slate-200 px-4 py-4 text-left transition-all hover:border-[var(--tenant-primary)] hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900 group-hover:text-[var(--tenant-primary)]">{norm.fullCode}</p>
              <p className="mt-1 text-sm text-slate-500 line-clamp-1">{norm.fullText.split("\n")[0]}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setSelectedNormId(null)}
        className="mb-4 text-sm font-semibold text-[var(--tenant-primary)] hover:underline"
      >
        ← Escolher outra norma
      </button>
      <EditorForm
        tenantSlug={tenantSlug}
        normId={selectedNorm.id}
        normCode={selectedNorm.fullCode}
        currentFullText={selectedNorm.fullText}
      />
    </>
  );
}
