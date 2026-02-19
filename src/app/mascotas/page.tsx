import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/pet-card";
import { PetFilters } from "./pet-filters";
import type { Pet } from "@/lib/types";

export default async function MascotasPage({
  searchParams,
}: {
  searchParams: Promise<{
    especie?: string;
    tamano?: string;
    edad?: string;
    sexo?: string;
    cuota?: string;
    estado?: string;
    ciudad?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("pets")
    .select("*")
    .eq("status", "disponible")
    .order("created_at", { ascending: false });

  if (params.especie) query = query.eq("species", params.especie);
  if (params.tamano)  query = query.eq("size", params.tamano);
  if (params.sexo)    query = query.eq("sex", params.sexo);
  if (params.estado)  query = query.eq("state", params.estado);
  if (params.ciudad)  query = query.eq("city", params.ciudad);

  if (params.cuota === "si")  query = query.eq("recovery_fee", true);
  if (params.cuota === "no")  query = query.eq("recovery_fee", false);

  if (params.edad === "cachorro") query = query.lt("age_months", 12);
  if (params.edad === "joven")    query = query.gte("age_months", 12).lt("age_months", 48);
  if (params.edad === "adulto")   query = query.gte("age_months", 48).lt("age_months", 108);
  if (params.edad === "senior")   query = query.gte("age_months", 108);

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
