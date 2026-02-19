"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, PawPrint } from "lucide-react";
import type { Pet } from "@/lib/types";

const statusLabel: Record<string, string> = {
  disponible: "Disponible",
  en_proceso: "En proceso",
  adoptado: "Adoptado",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  disponible: "default",
  en_proceso: "secondary",
  adoptado: "outline",
};

export default function MisMascotasPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("pets")
          .select("*")
          .eq("rescuer_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            setPets(data || []);
            setLoading(false);
          });
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis mascotas</h1>
        <Link href="/dashboard/mascotas/nueva">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Publicar mascota
          </Button>
        </Link>
      </div>

      {pets.length > 0 ? (
        <div className="space-y-4">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/dashboard/mascotas/${pet.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {pet.photos?.[0] ? (
                      <img
                        src={pet.photos[0]}
                        alt={pet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PawPrint className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{pet.name}</h3>
                      <Badge variant={statusVariant[pet.status]}>
                        {statusLabel[pet.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {pet.species} &middot; {pet.city}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <PawPrint className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            Aun no has publicado mascotas.
          </p>
          <Link href="/dashboard/mascotas/nueva">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Publicar mi primera mascota
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
