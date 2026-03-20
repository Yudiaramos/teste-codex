import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <span className="section-eyebrow">Erro 404</span>
      <div className="space-y-4">
        <h1 className="text-5xl">Pagina nao encontrada</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Verifique o slug do municipio. Exemplos validos nesta demo: `/piracicaba-sp` e `/campinas-sp`.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/piracicaba-sp">Abrir Piracicaba-SP</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/campinas-sp">Abrir Campinas-SP</Link>
        </Button>
      </div>
    </main>
  );
}
