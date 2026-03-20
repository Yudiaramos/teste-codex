"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface EditorFormProps {
  tenantSlug: string;
  normId: string;
  normCode: string;
  currentFullText: string;
}

export function EditorForm({ tenantSlug, normId, normCode, currentFullText }: EditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposedText, setProposedText] = useState(currentFullText);
  const [sourceNormId, setSourceNormId] = useState("");

  const [changeTarget, setChangeTarget] = useState("");
  const [changeType, setChangeType] = useState<string>("nova-redacao");
  const [changeBefore, setChangeBefore] = useState("");
  const [changeAfter, setChangeAfter] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [changeEvents, setChangeEvents] = useState<
    { target: string; changeType: string; beforeText: string; afterText: string; notes?: string }[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function addChangeEvent() {
    if (!changeTarget || !changeAfter) return;
    setChangeEvents((prev) => [
      ...prev,
      {
        target: changeTarget,
        changeType,
        beforeText: changeBefore,
        afterText: changeAfter,
        notes: changeNotes || undefined
      }
    ]);
    setChangeTarget("");
    setChangeBefore("");
    setChangeAfter("");
    setChangeNotes("");
  }

  function removeChangeEvent(index: number) {
    setChangeEvents((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(submitForReview: boolean) {
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        // 1. Create proposal
        const createRes = await fetch(`/api/admin/${tenantSlug}/proposals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            normId,
            sourceNormId: sourceNormId || undefined,
            title,
            description,
            proposedFullText: proposedText,
            changeEvents
          })
        });

        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err.message || "Falha ao criar proposta.");
        }

        const proposal = await createRes.json();

        // 2. Submit for review if requested
        if (submitForReview) {
          const submitRes = await fetch(`/api/admin/${tenantSlug}/proposals/${proposal.id}/submit`, {
            method: "POST"
          });

          if (!submitRes.ok) {
            const err = await submitRes.json();
            throw new Error(err.message || "Falha ao submeter para revisão.");
          }

          setSuccessMessage("Proposta criada e enviada para revisão!");
        } else {
          setSuccessMessage("Rascunho salvo com sucesso!");
        }

        setTimeout(() => {
          router.push(`/admin/${tenantSlug}/propostas`);
          router.refresh();
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-[2rem] border border-slate-200 p-6 space-y-5">
        <h2 className="text-2xl font-semibold text-slate-900">Metadados da proposta</h2>
        <p className="text-sm text-slate-500">Norma afetada: <strong>{normCode}</strong></p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Título da proposta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nova redação do art. 2"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Norma alteradora (ID, opcional)
            </label>
            <input
              type="text"
              value={sourceNormId}
              onChange={(e) => setSourceNormId(e.target.value)}
              placeholder="Ex: piracicaba-lc-418"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Justificativa / Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da alteração..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
          />
        </div>
      </div>

      {/* Text editor */}
      <div className="rounded-[2rem] border border-slate-200 p-6 space-y-5">
        <h2 className="text-2xl font-semibold text-slate-900">Texto legislativo proposto</h2>
        <p className="text-sm text-slate-500">
          Edite o texto completo da norma. Use uma linha por artigo, separados por linha em branco.
        </p>
        <textarea
          value={proposedText}
          onChange={(e) => setProposedText(e.target.value)}
          rows={20}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 font-mono text-sm leading-7 focus:border-[var(--tenant-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
        />
      </div>

      {/* Change events */}
      <div className="rounded-[2rem] border border-slate-200 p-6 space-y-5">
        <h2 className="text-2xl font-semibold text-slate-900">Dispositivos alterados</h2>
        <p className="text-sm text-slate-500">
          Registre cada dispositivo alterado com o texto anterior e o novo. Esses registros comporão o histórico
          público após a publicação.
        </p>

        {changeEvents.length > 0 && (
          <div className="space-y-3">
            {changeEvents.map((ce, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">
                      {ce.changeType.replace("-", " ")}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{ce.target}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChangeEvent(index)}
                    className="text-xs text-rose-500 hover:text-rose-700"
                  >
                    Remover
                  </button>
                </div>
                {ce.beforeText && (
                  <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    <span className="font-semibold">Antes:</span> {ce.beforeText}
                  </div>
                )}
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <span className="font-semibold">Depois:</span> {ce.afterText}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-slate-300 p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Dispositivo</label>
              <input
                type="text"
                value={changeTarget}
                onChange={(e) => setChangeTarget(e.target.value)}
                placeholder="Ex: Art. 2"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Tipo</label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="nova-redacao">Nova redação</option>
                <option value="acrescimo">Acréscimo</option>
                <option value="revogacao">Revogação</option>
                <option value="consolidacao">Consolidação</option>
                <option value="regulamentacao">Regulamentação</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Texto anterior</label>
            <textarea
              value={changeBefore}
              onChange={(e) => setChangeBefore(e.target.value)}
              rows={2}
              placeholder="Redação anterior do dispositivo..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Texto novo</label>
            <textarea
              value={changeAfter}
              onChange={(e) => setChangeAfter(e.target.value)}
              rows={2}
              placeholder="Nova redação do dispositivo..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Observação (opcional)</label>
            <input
              type="text"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addChangeEvent}
            disabled={!changeTarget || !changeAfter}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Adicionar dispositivo
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isPending || !title || !description || !proposedText}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isPending || !title || !description || !proposedText}
          className="rounded-2xl bg-[var(--tenant-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Enviando..." : "Enviar para revisão"}
        </button>
      </div>
    </div>
  );
}
