import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SolicitudesContent } from "./solicitudes-content";

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  let requests;

  if (profile.role === "rescatista") {
    // Get requests for rescuer's pets
    const { data } = await supabase
      .from("adoption_requests")
      .select(`
        *,
        pet:pets(*),
        adopter:profiles!adoption_requests_adopter_id_fkey(*)
      `)
      .in(
        "pet_id",
        (
          await supabase
            .from("pets")
            .select("id")
            .eq("rescuer_id", user.id)
        ).data?.map((p) => p.id) || []
      )
      .order("created_at", { ascending: false });
    requests = data;
  } else {
    // Get adopter's own requests
    const { data } = await supabase
      .from("adoption_requests")
      .select(`
        *,
        pet:pets(*)
      `)
      .eq("adopter_id", user.id)
      .order("created_at", { ascending: false });
    requests = data;
  }

  return (
    <SolicitudesContent
      requests={requests || []}
      role={profile.role}
      userId={user.id}
    />
  );
}
