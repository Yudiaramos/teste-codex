"use client";

import { ArrowLeft, CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface IngestionResult {
  norm: {
    id: string;
    fullCode: string;
    title: string;
    type: string;
    typeLabel: string;
    tags: string[];
  };
  action: "created" | "updated" | "skipped";
  message: string;
}

export default function IngestaoPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IngestionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      } else if (rawText.trim()) {
        formData.append("rawText", rawText);
      } else {
        setError("Selecione um arquivo ou cole o texto da norma.");
        setLoading(false);
        return;
      }

      formData.append("uploaderEmail", "admin@legisdigital.com");

      const response = await fetch(`/api/admin/${tenant}/ingest`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao processar a norma.");
        return;
      }

      setResults((prev) => [data, ...prev]);
      setRawText("");
      setFile(null);
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ingestão de Normas</h1>
          <p className="text-sm text-slate-500">
            Faça upload de PDFs ou cole o texto de legislação para adicionar ao acervo automaticamente.
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <Card className="border-2 border-dashed border-slate-300 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload de Arquivo
          </CardTitle>
          <CardDescription>
            Arraste um PDF ou arquivo de texto, ou clique para selecionar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  className="ml-4 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-500">
                  Arraste um arquivo aqui ou <span className="font-medium text-blue-600">clique para selecionar</span>
                </p>
                <p className="text-xs text-slate-400">PDF, TXT (máx. 10 MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            id="file-input"
            className="hidden"
            accept=".pdf,.txt,.text"
            onChange={handleFileInput}
          />
        </CardContent>
      </Card>

      {/* Raw Text Card */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-emerald-600" />
            Colar Texto Diretamente
          </CardTitle>
          <CardDescription>
            Cole o texto completo da norma abaixo. A IA vai classificar automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[200px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
            placeholder={`Cole o texto da norma aqui...\n\nExemplo:\nLei Complementar nº 500, de 15 de março de 2026\n\nDispõe sobre a criação do programa municipal de...\n\nArt. 1º Fica instituído...\nArt. 2º ...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="h-14 rounded-2xl px-8"
          onClick={handleSubmit}
          disabled={loading || (!rawText.trim() && !file)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Processar e Classificar
            </>
          )}
        </Button>
        {error ? (
          <p className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            {error}
          </p>
        ) : null}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Resultados da Ingestão</CardTitle>
            <CardDescription>{results.length} norma(s) processada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div
                  key={`${result.norm.id}-${idx}`}
                  className={`flex items-start gap-3 rounded-xl border p-4 ${
                    result.action === "created"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : result.action === "updated"
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <CheckCircle2
                    className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                      result.action === "created"
                        ? "text-emerald-600"
                        : result.action === "updated"
                          ? "text-blue-600"
                          : "text-slate-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{result.norm.fullCode}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          result.action === "created"
                            ? "bg-emerald-100 text-emerald-700"
                            : result.action === "updated"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {result.action === "created" ? "NOVA" : result.action === "updated" ? "ATUALIZADA" : "EXISTENTE"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{result.norm.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {result.norm.typeLabel}
                      </span>
                      {result.norm.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
