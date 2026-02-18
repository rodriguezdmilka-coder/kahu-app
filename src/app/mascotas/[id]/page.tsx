import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PetDetail } from "./pet-detail";

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();

  if (!pet) {
    notFound();
  }

  const { data: rescuer } = await supabase
    .from("profiles")
    .select("full_name, city")
    .eq("id", pet.rescuer_id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  let existingRequest = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = profile;

    const { data: request } = await supabase
      .from("adoption_requests")
      .select("*")
      .eq("adopter_id", user.id)
      .eq("pet_id", id)
      .maybeSingle();
    existingRequest = request;
  }

  return (
    <PetDetail
      pet={pet}
      rescuerName={rescuer?.full_name || "Rescatista"}
      userProfile={userProfile}
      existingRequest={existingRequest}
    />
  );
}
