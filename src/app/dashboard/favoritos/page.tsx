"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PetCard } from "@/components/pet-card";
import { Heart } from "lucide-react";
import type { Pet } from "@/lib/types";

export default function FavoritosPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: favs } = await supabase
        .from("favorites")
        .select("pet:pets(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const petList = (favs ?? []).map((f: any) => f.pet).filter(Boolean) as Pet[];

      setPets(petList);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Mis favoritos</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Las mascotas que guardaste con ❤️
      </p>

      {pets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            Aun no tienes mascotas guardadas.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toca el corazon en las tarjetas del{" "}
            <Link href="/mascotas" className="text-primary underline">
              catalogo
            </Link>{" "}
            para guardar tus favoritas.
          </p>
        </div>
      )}
    </div>
  );
}
