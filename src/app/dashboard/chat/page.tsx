import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, PawPrint } from "lucide-react";

export default async function ChatListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      request:adoption_requests(
        pet:pets(name, photos)
      )
    `)
    .or(`rescuer_id.eq.${user.id},adopter_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Get the other person's name for each conversation
  const enrichedConversations = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherId =
        conv.rescuer_id === user.id ? conv.adopter_id : conv.rescuer_id;
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherId)
        .single();

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...conv,
        otherName: otherProfile?.full_name || "Usuario",
        lastMessage: lastMsg?.content || "Sin mensajes aun",
        lastMessageAt: lastMsg?.created_at || conv.created_at,
      };
    })
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mensajes</h1>

      {enrichedConversations.length > 0 ? (
        <div className="space-y-3">
          {enrichedConversations.map((conv) => (
            <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                    {conv.request?.pet?.photos?.[0] ? (
                      <img
                        src={conv.request.pet.photos[0]}
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
                        {conv.request?.pet?.name}
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
