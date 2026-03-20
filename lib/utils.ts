import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNormCode(type: string, number: string, year: number) {
  return `${type} ${number}/${year}`;
}

export function formatDate(date: Date | string | null | undefined, locale = "pt-BR") {
  if (!date) {
    return "Nao informada";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long"
  }).format(new Date(date));
}

export function formatCompactDate(date: Date | string | null | undefined, locale = "pt-BR") {
  if (!date) {
    return "--";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
