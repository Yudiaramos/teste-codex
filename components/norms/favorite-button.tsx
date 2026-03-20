"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  tenantSlug: string;
  normId: string;
}

async function fetchFavorites(tenantSlug: string) {
  const response = await fetch(`/api/${tenantSlug}/favorites`, {
    credentials: "include"
  });

  if (response.status === 401) {
    return [] as string[];
  }

  const data = await response.json();
  return (data.items ?? []).map((item: { normId: string }) => item.normId as string);
}

export function FavoriteButton({ tenantSlug, normId }: FavoriteButtonProps) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const queryKey = ["favorites", tenantSlug];

  const { data: favorites = [] } = useQuery({
    queryKey,
    queryFn: () => fetchFavorites(tenantSlug)
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${tenantSlug}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ normId })
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel favoritar.");
      }

      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const isFavorite = favorites.includes(normId);

  return (
    <Button
      type="button"
      variant={isFavorite ? "accent" : "outline"}
      size="sm"
      disabled={status === "unauthenticated" || mutation.isPending}
      onClick={() => mutation.mutate()}
      title={status === "unauthenticated" ? "Faça login no admin demo para testar favoritos." : "Favoritar norma"}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      Favoritar
    </Button>
  );
}
