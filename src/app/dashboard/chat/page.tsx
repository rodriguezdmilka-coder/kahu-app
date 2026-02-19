"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, PawPrint } from "lucide-react";

interface ConversationItem {
  id: string;
  rescuer_id: string;
  adopter_id: string;
  otherName: string;
  petName: string;
  petPhoto: string | null;
  lastMessage: string;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: convs } = await supabase
        .from("conversations")
        .select(`*, request:adoption_requests(pet:pets(name, photos))`)
        .or(`rescuer_id.eq.${user.id},adopter_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const enriched = await Promise.all(
        (convs || []).map(async (conv) => {
          const otherId =
            conv.rescuer_id === user.id ? conv.adopter_id : conv.rescuer_id;

          const { data: other } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherId)
            .single();

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            rescuer_id: conv.rescuer_id,
            adopter_id: conv.adopter_id,
            otherName: other?.full_name || "Usuario",
            petName: conv.request?.pet?.name || "Mascota",
            petPhoto: conv.request?.pet?.photos?.[0] || null,
            lastMessage: lastMsg?.content || "Sin mensajes aun",
          };
        })
      );

      setConversations(enriched);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mensajes</h1>

      {conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                    {conv.petPhoto ? (
                      <img
                        src={conv.petPhoto}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PawPrint className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{conv.otherName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {conv.petName}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.lastMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            No tienes conversaciones activas.
          </p>
          <p className="text-sm text-muted-foreground">
            Las conversaciones se crean cuando una solicitud de adopcion es
            aceptada.
          </p>
        </div>
      )}
    </div>
  );
}
