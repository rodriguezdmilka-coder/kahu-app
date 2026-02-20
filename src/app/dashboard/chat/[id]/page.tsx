"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatRoom } from "./chat-room";
import type { Message } from "@/lib/types";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [chatData, setChatData] = useState<{
    currentUserId: string;
    otherUserName: string;
    petName: string;
    petId: string;
    requestId: string;
    initialMessages: Message[];
    initialStatus: string;
    initialConfirmedRescuer: boolean;
    initialConfirmedAdopter: boolean;
    isRescuer: boolean;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }

      const { data: conversation } = await supabase
        .from("conversations")
        .select(`*, request:adoption_requests(id, status, confirmed_by_rescuer, confirmed_by_adopter, pet:pets(id, name))`)
        .eq("id", params.id)
        .single();

      if (
        !conversation ||
        (conversation.rescuer_id !== user.id && conversation.adopter_id !== user.id)
      ) {
        router.replace("/dashboard/chat");
        return;
      }

      const isRescuer = conversation.rescuer_id === user.id;
      const otherId = isRescuer ? conversation.adopter_id : conversation.rescuer_id;

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherId)
        .single();

      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", params.id)
        .order("created_at", { ascending: true });

      const req = conversation.request;

      setChatData({
        currentUserId: user.id,
        otherUserName: otherProfile?.full_name || "Usuario",
        petName: req?.pet?.name || "Mascota",
        petId: req?.pet?.id || "",
        requestId: req?.id || "",
        initialMessages: messages || [],
        initialStatus: req?.status || "aceptada",
        initialConfirmedRescuer: req?.confirmed_by_rescuer ?? false,
        initialConfirmedAdopter: req?.confirmed_by_adopter ?? false,
        isRescuer,
      });
    });
  }, [params.id, router]);

  if (!chatData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Cargando chat...</p>
      </div>
    );
  }

  return (
    <ChatRoom
      conversationId={params.id as string}
      currentUserId={chatData.currentUserId}
      otherUserName={chatData.otherUserName}
      petName={chatData.petName}
      petId={chatData.petId}
      requestId={chatData.requestId}
      initialMessages={chatData.initialMessages}
      initialStatus={chatData.initialStatus}
      initialConfirmedRescuer={chatData.initialConfirmedRescuer}
      initialConfirmedAdopter={chatData.initialConfirmedAdopter}
      isRescuer={chatData.isRescuer}
    />
  );
}
