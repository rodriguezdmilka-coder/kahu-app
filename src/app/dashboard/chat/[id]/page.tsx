import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatRoom } from "./chat-room";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      *,
      request:adoption_requests(
        pet:pets(name, photos)
      )
    `)
    .eq("id", id)
    .single();

  if (
    !conversation ||
    (conversation.rescuer_id !== user.id &&
      conversation.adopter_id !== user.id)
  ) {
    redirect("/dashboard/chat");
  }

  const otherId =
    conversation.rescuer_id === user.id
      ? conversation.adopter_id
      : conversation.rescuer_id;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <ChatRoom
      conversationId={id}
      currentUserId={user.id}
      otherUserName={otherProfile?.full_name || "Usuario"}
      petName={conversation.request?.pet?.name || "Mascota"}
      initialMessages={messages || []}
    />
  );
}
