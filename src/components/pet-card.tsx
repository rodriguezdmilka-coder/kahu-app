"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Pet } from "@/lib/types";

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  let text = `${years} ${years === 1 ? "ano" : "anos"}`;
  if (remaining > 0) text += ` ${remaining} m`;
  return text;
}

export function PetCard({ pet }: { pet: Pet }) {
  const photoUrl = pet.photos?.[0] || "/placeholder-pet.svg";
  const [isFav, setIsFav] = useState(false);
  const [isAdoptante, setIsAdoptante] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "adoptante") return;

      setUserId(user.id);
      setIsAdoptante(true);

      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("pet_id", pet.id)
        .maybeSingle();

      if (fav) setIsFav(true);
    });
  }, [pet.id]);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || loading) return;

    setLoading(true);
    const supabase = createClient();

    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("pet_id", pet.id);
      setIsFav(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: userId, pet_id: pet.id });
      setIsFav(true);
    }
    setLoading(false);
  };

  return (
    <Link href={`/mascotas/${pet.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={photoUrl}
            alt={pet.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {isAdoptante && (
            <button
              onClick={toggleFav}
              disabled={loading}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </button>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{pet.name}</h3>
            <Badge variant={pet.species === "perro" ? "default" : "secondary"}>
              {pet.species}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatAge(pet.age_months)}</span>
              <span className="mx-1">&middot;</span>
              <span className="capitalize">{pet.sex}</span>
              <span className="mx-1">&middot;</span>
              <span className="capitalize">{pet.size}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{pet.city}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
