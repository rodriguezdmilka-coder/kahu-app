import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/pet-card";
import { PetFilters } from "./pet-filters";
import type { Pet } from "@/lib/types";

export default async function MascotasPage({
  searchParams,
}: {
  searchParams: Promise<{ especie?: string; ciudad?: string; tamano?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("pets")
    .select("*")
    .eq("status", "disponible")
    .order("created_at", { ascending: false });

  if (params.especie) {
    query = query.eq("species", params.especie);
  }
  if (params.ciudad) {
    query = query.ilike("city", `%${params.ciudad}%`);
  }
  if (params.tamano) {
    query = query.eq("size", params.tamano);
  }

  const { data: pets } = await query;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Mascotas en adopcion</h1>
      <p className="mb-8 text-muted-foreground">
        Encuentra a tu nuevo companero de vida.
      </p>

      <PetFilters />

      {pets && pets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet: Pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No hay mascotas disponibles con esos filtros.
          </p>
          <p className="text-sm text-muted-foreground">
            Intenta cambiar los filtros o vuelve mas tarde.
          </p>
        </div>
      )}
    </div>
  );
}
