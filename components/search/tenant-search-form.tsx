"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Search, SlidersHorizontal, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { type SearchFormValues, searchFormSchema } from "@/features/search/search.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NormTypeOption {
  id: string;
  code: string;
  label: string;
}

interface NormStatusOption {
  id: string;
  code: string;
  label: string;
}

async function getSuggestions(tenantSlug: string, query: string) {
  const params = new URLSearchParams({ suggest: "1", query });
  const response = await fetch(`/api/${tenantSlug}/search?${params.toString()}`);
  const data = await response.json();
  return data.suggestions as string[];
}

async function getNormTypes(tenantSlug: string) {
  const response = await fetch(`/api/${tenantSlug}/norm-types`);
  const data = await response.json();
  return data as { types: NormTypeOption[]; statuses: NormStatusOption[] };
}

export function TenantSearchForm({
  tenantSlug,
  defaultValues,
  mode = "simple",
  className
}: {
  tenantSlug: string;
  defaultValues?: Partial<SearchFormValues>;
  mode?: "simple" | "advanced";
  className?: string;
}) {
  const router = useRouter();
  const [advancedOpen, setAdvancedOpen] = useState(mode === "advanced");
  const [isFocused, setIsFocused] = useState(false);
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
      number: "",
      year: "",
      type: "",
      theme: "",
      classification: "",
      authorship: "",
      initiative: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      sort: "relevance",
      ...defaultValues
    }
  });

  const queryValue = form.watch("query") ?? "";

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["search-suggestions", tenantSlug, queryValue],
    queryFn: () => getSuggestions(tenantSlug, queryValue),
    enabled: queryValue.trim().length >= 2
  });

  const { data: normOptions } = useQuery({
    queryKey: ["norm-types", tenantSlug],
    queryFn: () => getNormTypes(tenantSlug),
    staleTime: 60_000
  });

  useEffect(() => {
    if (mode === "advanced") {
      setAdvancedOpen(true);
    }
  }, [mode]);

  const suggestionList = useMemo(() => suggestions.slice(0, 5), [suggestions]);

  function onSubmit(values: SearchFormValues) {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/${tenantSlug}/resultados?${params.toString()}`);
  }

  const selectClassName =
    "mt-1 flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      <div
        className={`rounded-[2rem] border bg-white/95 p-4 shadow-panel backdrop-blur-sm transition-all duration-300 ${
          isFocused
            ? "border-[var(--tenant-primary)]/30 shadow-[0_0_0_3px_var(--glow-primary),0_24px_80px_-32px_rgba(10,77,110,0.30)]"
            : "border-slate-200"
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Label htmlFor="query" className="sr-only">Pesquisar norma</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="query"
                placeholder="Pesquise por IPTU, Lei Orgânica, mobilidade urbana..."
                className="h-14 rounded-2xl border-0 bg-slate-50/80 pl-12 pr-4 text-base shadow-none ring-0 placeholder:text-slate-400 focus:bg-white focus:ring-0"
                {...form.register("query")}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {isFetching ? (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              ) : null}
            </div>
            {suggestionList.length > 0 && isFocused ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-lg">
                {suggestionList.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onMouseDown={() => form.setValue("query", suggestion)}
                  >
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="lg" className="h-14 rounded-2xl px-8">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 rounded-2xl"
              onClick={() => setAdvancedOpen((value) => !value)}
              aria-expanded={advancedOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Avançada</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${advancedOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        <div
          className={`grid transition-all duration-400 ease-out ${
            advancedOpen
              ? "mt-5 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" placeholder="405" className="mt-1" {...form.register("number")} />
              </div>
              <div>
                <Label htmlFor="year">Ano</Label>
                <Input id="year" placeholder="2025" className="mt-1" {...form.register("year")} />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <select id="type" className={selectClassName} {...form.register("type")}>
                  <option value="">Todos</option>
                  {(normOptions?.types ?? []).map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Situação</Label>
                <select id="status" className={selectClassName} {...form.register("status")}>
                  <option value="">Todas</option>
                  {(normOptions?.statuses ?? []).map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Input id="theme" placeholder="Tributação" className="mt-1" {...form.register("theme")} />
              </div>
              <div>
                <Label htmlFor="classification">Classificação</Label>
                <Input id="classification" placeholder="Urbanística" className="mt-1" {...form.register("classification")} />
              </div>
              <div>
                <Label htmlFor="authorship">Autoria</Label>
                <Input id="authorship" placeholder="Prefeitura Municipal" className="mt-1" {...form.register("authorship")} />
              </div>
              <div>
                <Label htmlFor="initiative">Iniciativa</Label>
                <Input id="initiative" placeholder="Executivo" className="mt-1" {...form.register("initiative")} />
              </div>
              <div>
                <Label htmlFor="dateFrom">Data inicial</Label>
                <Input id="dateFrom" type="date" className="mt-1" {...form.register("dateFrom")} />
              </div>
              <div>
                <Label htmlFor="dateTo">Data final</Label>
                <Input id="dateTo" type="date" className="mt-1" {...form.register("dateTo")} />
              </div>
              <div>
                <Label htmlFor="sort">Ordenação</Label>
                <select
                  id="sort"
                  className={selectClassName}
                  {...form.register("sort")}
                >
                  <option value="relevance">Relevância</option>
                  <option value="recent">Mais recentes</option>
                  <option value="popular">Mais acessadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
