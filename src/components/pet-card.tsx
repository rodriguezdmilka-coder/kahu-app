import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
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

  return (
    <Link href={`/mascotas/${pet.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={photoUrl}
            alt={pet.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
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
