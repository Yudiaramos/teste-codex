import React from "react";

import { Badge } from "@/components/ui/badge";
import { type NormStatusCode } from "@/types/domain";

const statusVariant: Record<NormStatusCode, "success" | "danger" | "warning" | "info"> = {
  vigente: "success",
  revogada: "danger",
  alterada: "warning",
  historica: "info"
};

const statusLabel: Record<NormStatusCode, string> = {
  vigente: "Vigente",
  revogada: "Revogada",
  alterada: "Alterada",
  historica: "Historica"
};

export function StatusBadge({ status }: { status: NormStatusCode }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}
