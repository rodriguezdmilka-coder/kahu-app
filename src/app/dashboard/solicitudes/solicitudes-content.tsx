"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ClipboardList, PawPrint } from "lucide-react";
import type { UserRole } from "@/lib/types";

/* Muestra las respuestas del formulario de adopcion de forma legible */
function AdoptionAnswers({ message }: { message: string }) {
  let parsed: Record<string, string | string[]> | null = null;
  try {
    const obj = JSON.parse(message);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) parsed = obj;
  } catch {
    // mensaje de texto plano (solicitudes antiguas)
  }

  if (!parsed) {
    return <p className="mb-3 text-sm">{message}</p>;
  }

  return (
    <div className="mb-3 space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
      {Object.entries(parsed).map(([label, value]) => (
        <div key={label} className="flex flex-col sm:flex-row sm:gap-2">
          <span className="font-medium text-foreground shrink-0">{label}:</span>
          <span className="text-muted-foreground">
            {Array.isArray(value) ? value.join(", ") : value}
          </span>
        </div>
      ))}
    </div>
  );
}

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pendiente: "secondary",
  aceptada: "default",
  rechazada: "destructive",
};

interface RequestWithRelations {
  id: string;
  adopter_id: string;
  pet_id: string;
  message: string;
  status: string;
  created_at: string;
  pet?: { name: string; species: string; photos: string[] };
  adopter?: { full_name: string; city: string; phone: string | null };
}

export function SolicitudesContent({
  requests,
  role,
  userId,
}: {
  requests: RequestWithRelations[];
  role: UserRole;
  userId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (
    requestId: string,
    action: "aceptada" | "rechazada",
    adopterId: string,
    petId: string
  ) => {
    setLoadingId(requestId);
    const supabase = createClient();

    // Update request status
    await supabase
      .from("adoption_requests")
      .update({ status: action })
      .eq("id", requestId);

    if (action === "aceptada") {
      // Update pet status
      await supabase
        .from("pets")
        .update({ status: "en_proceso" })
        .eq("id", petId);

      // Create conversation
      await supabase.from("conversations").insert({
        request_id: requestId,
        rescuer_id: userId,
        adopter_id: adopterId,
      });
    }

    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        {role === "rescatista" ? "Solicitudes recibidas" : "Mis solicitudes"}
      </h1>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {req.pet?.photos?.[0] ? (
                      <img
                        src={req.pet.photos[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PawPrint className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">
                        {req.pet?.name || "Mascota"}
                      </h3>
                      <Badge variant={statusVariant[req.status]}>
                        {statusLabel[req.status]}
                      </Badge>
                    </div>

                    {role === "rescatista" && req.adopter && (
                      <p className="mb-1 text-sm text-muted-foreground">
                        Solicitante: {req.adopter.full_name} &middot;{" "}
                        {req.adopter.city}
                        {req.adopter.phone && ` &middot; ${req.adopter.phone}`}
                      </p>
                    )}

                    <AdoptionAnswers message={req.message} />

                    {role === "rescatista" && req.status === "pendiente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          disabled={loadingId === req.id}
                          onClick={() =>
                            handleAction(
                              req.id,
                              "aceptada",
                              req.adopter_id,
                              req.pet_id
                            )
                          }
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={loadingId === req.id}
                          onClick={() =>
                            handleAction(
                              req.id,
                              "rechazada",
                              req.adopter_id,
                              req.pet_id
                            )
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            {role === "rescatista"
              ? "Aun no has recibido solicitudes."
              : "Aun no has enviado solicitudes."}
          </p>
        </div>
      )}
    </div>
  );
}
