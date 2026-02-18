"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Calendar, Heart, ArrowLeft, User } from "lucide-react";
import type { Pet, Profile, AdoptionRequest } from "@/lib/types";

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  let text = `${years} ${years === 1 ? "ano" : "anos"}`;
  if (remaining > 0) text += ` ${remaining} m`;
  return text;
}

export function PetDetail({
  pet,
  rescuerName,
  userProfile,
  existingRequest,
}: {
  pet: Pet;
  rescuerName: string;
  userProfile: Profile | null;
  existingRequest: AdoptionRequest | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRequest);

  const handleAdoptionRequest = async () => {
    if (!userProfile || !message.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("adoption_requests").insert({
      adopter_id: userProfile.id,
      pet_id: pet.id,
      message: message.trim(),
    });

    if (!error) {
      setSubmitted(true);
      setDialogOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  const photoUrl = pet.photos?.[0] || "/placeholder-pet.svg";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Foto */}
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          <img
            src={photoUrl}
            alt={pet.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <Badge variant={pet.species === "perro" ? "default" : "secondary"}>
              {pet.species}
            </Badge>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatAge(pet.age_months)}
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {pet.sex} &middot; {pet.size}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {pet.city}
            </div>
          </div>

          {pet.breed && (
            <p className="mb-2 text-sm">
              <span className="font-medium">Raza:</span> {pet.breed}
            </p>
          )}

          <div className="mb-6">
            <h2 className="mb-2 font-semibold">Sobre {pet.name}</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {pet.description}
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Publicado por {rescuerName}</span>
          </div>

          {/* Boton de adopcion */}
          {pet.status !== "disponible" ? (
            <Badge variant="secondary" className="text-base">
              {pet.status === "en_proceso" ? "En proceso de adopcion" : "Adoptado"}
            </Badge>
          ) : submitted || existingRequest ? (
            <div className="rounded-lg border bg-primary/5 p-4 text-center">
              <p className="font-medium text-primary">Solicitud enviada</p>
              <p className="text-sm text-muted-foreground">
                El rescatista revisara tu solicitud.
              </p>
            </div>
          ) : !userProfile ? (
            <div className="space-y-2">
              <Link href="/registro">
                <Button size="lg" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Registrate para adoptar
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                Necesitas una cuenta para solicitar la adopcion.
              </p>
            </div>
          ) : userProfile.role === "rescatista" ? (
            <p className="text-sm text-muted-foreground">
              Como rescatista no puedes solicitar adopciones.
            </p>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Solicitar adopcion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar adopcion de {pet.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Cuentanos por que quieres adoptar a {pet.name}
                    </Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ej: Vivo en una casa con jardin, tengo experiencia con mascotas..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleAdoptionRequest}
                    disabled={loading || !message.trim()}
                    className="w-full"
                  >
                    {loading ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
