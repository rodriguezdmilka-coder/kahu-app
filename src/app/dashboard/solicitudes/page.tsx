"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SolicitudesContent } from "./solicitudes-content";
import type { UserRole } from "@/lib/types";

export default function SolicitudesPage() {
  const [data, setData] = useState<{
    requests: unknown[];
    role: UserRole;
    userId: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      let requests;

      if (profile.role === "rescatista") {
        const { data: pets } = await supabase
          .from("pets")
          .select("id")
          .eq("rescuer_id", user.id);

        const petIds = (pets || []).map((p: { id: string }) => p.id);

        if (petIds.length > 0) {
          const { data: reqs } = await supabase
            .from("adoption_requests")
            .select(
              `*, pet:pets(*), adopter:profiles!adoption_requests_adopter_id_fkey(*)`
            )
            .in("pet_id", petIds)
            .order("created_at", { ascending: false });
          requests = reqs;
        } else {
          requests = [];
        }
      } else {
        const { data: reqs } = await supabase
          .from("adoption_requests")
          .select(`*, pet:pets(*)`)
          .eq("adopter_id", user.id)
          .order("created_at", { ascending: false });
        requests = reqs;
      }

      setData({ requests: requests || [], role: profile.role, userId: user.id });
    });
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <SolicitudesContent
      requests={data.requests as never}
      role={data.role}
      userId={data.userId}
    />
  );
}
