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

  return (
    <PetDetail
      pet={pet}
      rescuerName={rescuer?.full_name || "Rescatista"}
    />
  );
}
