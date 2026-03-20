"use client";

import { useState } from "react";

interface NormChangeEventData {
  id: string;
  kind: string;
  target: string;
  summary: string;
  effectiveDate: string;
  beforeText?: string;
  afterText?: string;
  notes?: string;
  sourceNormId?: string;
  sourceNormCode?: string;
}

interface ArticleIndexEntry {
  id: string;
  label: string;
  content: string;
}

interface NormTextTabsProps {
  currentText: string;
  originalText: string;
  changeEvents: NormChangeEventData[];
  articleIndex: ArticleIndexEntry[];
}

type TabKey = "compilado" | "original" | "alteracoes";

export function NormTextTabs({ currentText, originalText, changeEvents, articleIndex }: NormTextTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("compilado");

  const tabs: { key: TabKey; label: string; description: string }[] = [
    {
      key: "compilado",
      label: "Texto compilado",
      description: "Texto vigente com alterações destacadas inline."
    },
    {
      key: "original",
      label: "Texto original",
      description: "Redação original sem nenhuma alteração."
    },
    {
      key: "alteracoes",
      label: "Alterações",
      description: "Todas as mudanças documentadas nesta norma."
    }
  ];

  // Build a map of targets → change events for inline display
  const changesByTarget = new Map<string, NormChangeEventData[]>();
  changeEvents.forEach((ce) => {
    const key = ce.target.toLowerCase().trim();
    const existing = changesByTarget.get(key) ?? [];
    existing.push(ce);
    changesByTarget.set(key, existing);
  });

  function getArticleTarget(paragraph: string): string | null {
    const match = paragraph.match(/^(Art\.\s*\d+[\w-]*)/i);
    return match ? match[1].toLowerCase().trim() : null;
  }

  function findChangeForParagraph(paragraph: string): NormChangeEventData[] | null {
    const target = getArticleTarget(paragraph);
    if (!target) return null;
    return changesByTarget.get(target) ?? null;
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        {tabs.find((t) => t.key === activeTab)?.description}
      </p>

      {/* Tab content */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8">
        {activeTab === "compilado" && (
          <CompiledTextView
            currentText={currentText}
            changeEvents={changeEvents}
            articleIndex={articleIndex}
            findChangeForParagraph={findChangeForParagraph}
          />
        )}

        {activeTab === "original" && (
          <OriginalTextView originalText={originalText} />
        )}

        {activeTab === "alteracoes" && (
          <ChangesOnlyView changeEvents={changeEvents} />
        )}
      </div>
    </div>
  );
}

/* ─── Tab 1: Texto compilado ─── */
function CompiledTextView({
  currentText,
  changeEvents,
  articleIndex,
  findChangeForParagraph
}: {
  currentText: string;
  changeEvents: NormChangeEventData[];
  articleIndex: ArticleIndexEntry[];
  findChangeForParagraph: (paragraph: string) => NormChangeEventData[] | null;
}) {
  const paragraphs = currentText.split("\n\n");

  return (
    <div className="space-y-0">
      {paragraphs.map((paragraph, i) => {
        const indexItem = articleIndex.find((entry) => entry.content === paragraph);
        const changes = findChangeForParagraph(paragraph);
        const isArticle = paragraph.startsWith("Art.");

        return (
          <div key={i} id={indexItem?.id} className={isArticle ? "scroll-mt-24" : ""}>
            {/* If there are changes for this article, show inline annotations */}
            {changes && changes.length > 0 ? (
              <div className="mb-6">
                {changes.map((ce) => (
                  <div key={ce.id} className="mb-4">
                    {/* Strikethrough old text */}
                    {ce.beforeText && (
                      <div className="relative mb-2 rounded-xl border-l-4 border-rose-300 bg-rose-50/60 px-4 py-3">
                        <span className="absolute -top-2.5 left-3 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                          Redação anterior
                        </span>
                        <p className="mt-1 text-sm leading-7 text-rose-800/80 line-through decoration-rose-400/60">
                          {ce.beforeText}
                        </p>
                      </div>
                    )}

                    {/* New text highlighted */}
                    <div className="relative rounded-xl border-l-4 border-emerald-300 bg-emerald-50/60 px-4 py-3">
                      <span className="absolute -top-2.5 left-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                        {ce.kind === "acrescimo" ? "Acrescido" : "Nova redação"}
                      </span>
                      <p className="mt-1 text-sm font-medium leading-7 text-emerald-900">
                        {ce.afterText || paragraph}
                      </p>
                      {ce.sourceNormCode && (
                        <p className="mt-1 text-xs text-emerald-600/80">
                          (Alterado por {ce.sourceNormCode})
                        </p>
                      )}
                    </div>

                    {ce.notes && (
                      <p className="mt-1 pl-4 text-xs italic text-slate-500">{ce.notes}</p>
                    )}
                  </div>
                ))}

                {/* Current consolidated text (below the changes) */}
                <p className={`leading-8 text-slate-700 ${isArticle ? "font-medium text-slate-900" : ""}`}>
                  {paragraph}
                </p>
              </div>
            ) : (
              /* Normal paragraph with no changes */
              <p className={`mb-4 leading-8 text-slate-700 ${isArticle ? "font-medium text-slate-900" : ""}`}>
                {paragraph}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Tab 2: Texto original ─── */
function OriginalTextView({ originalText }: { originalText: string }) {
  return (
    <div>
      {originalText.split("\n\n").map((paragraph, i) => (
        <p
          key={i}
          className={`mb-4 leading-8 text-slate-700 ${paragraph.startsWith("Art.") ? "font-medium text-slate-900" : ""}`}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/* ─── Tab 3: Somente alterações ─── */
function ChangesOnlyView({ changeEvents }: { changeEvents: NormChangeEventData[] }) {
  if (changeEvents.length === 0) {
    return (
      <p className="text-sm text-slate-500">Nenhuma alteração documentada para esta norma.</p>
    );
  }

  return (
    <div className="space-y-6">
      {changeEvents.map((event) => (
        <div key={event.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
              {event.kind.replace("-", " ")}
            </span>
            <span className="text-sm font-semibold text-slate-900">{event.target}</span>
            <span className="text-xs text-slate-500">• {event.effectiveDate}</span>
          </div>

          <p className="text-sm font-medium text-slate-700">{event.summary}</p>

          {/* Before */}
          {event.beforeText && (
            <div className="rounded-xl border-l-4 border-rose-300 bg-rose-50/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">Redação anterior</p>
              <p className="mt-1.5 text-sm leading-7 text-rose-800/80 line-through decoration-rose-400/60">
                {event.beforeText}
              </p>
            </div>
          )}

          {/* After */}
          {event.afterText && (
            <div className="rounded-xl border-l-4 border-emerald-300 bg-emerald-50/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Nova redação</p>
              <p className="mt-1.5 text-sm font-medium leading-7 text-emerald-900">
                {event.afterText}
              </p>
            </div>
          )}

          {event.notes && <p className="text-sm italic text-slate-500">{event.notes}</p>}
        </div>
      ))}
    </div>
  );
}
