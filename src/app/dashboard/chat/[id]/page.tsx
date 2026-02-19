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
    initialMessages: Message[];
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: conversation } = await supabase
        .from("conversations")
        .select(`*, request:adoption_requests(pet:pets(name))`)
        .eq("id", params.id)
        .single();

      if (
        !conversation ||
        (conversation.rescuer_id !== user.id &&
          conversation.adopter_id !== user.id)
      ) {
        router.replace("/dashboard/chat");
        return;
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
        .eq("conversation_id", params.id)
        .order("created_at", { ascending: true });

      setChatData({
        currentUserId: user.id,
        otherUserName: otherProfile?.full_name || "Usuario",
        petName: conversation.request?.pet?.name || "Mascota",
        initialMessages: messages || [],
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
      initialMessages={chatData.initialMessages}
    />
  );
}
