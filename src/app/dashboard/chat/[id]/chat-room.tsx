"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle2, Upload, PartyPopper } from "lucide-react";
import type { Message } from "@/lib/types";

export function ChatRoom({
  conversationId,
  currentUserId,
  otherUserName,
  petName,
  petId,
  requestId,
  initialMessages,
  initialStatus,
  initialConfirmedRescuer,
  initialConfirmedAdopter,
  isRescuer,
}: {
  conversationId: string;
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
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Confirmation state
  const [reqStatus, setReqStatus] = useState(initialStatus);
  const [confirmedRescuer, setConfirmedRescuer] = useState(initialConfirmedRescuer);
  const [confirmedAdopter, setConfirmedAdopter] = useState(initialConfirmedAdopter);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const myConfirmed = isRescuer ? confirmedRescuer : confirmedAdopter;
  const otherConfirmed = isRescuer ? confirmedAdopter : confirmedRescuer;
  const isCompleted = reqStatus === "completada";

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime: mensajes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Realtime: estado de la solicitud (para ver confirmacion del otro)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`request-${requestId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "adoption_requests",
        filter: `id=eq.${requestId}`,
      }, (payload) => {
        const updated = payload.new as {
          status: string;
          confirmed_by_rescuer: boolean;
          confirmed_by_adopter: boolean;
        };
        setReqStatus(updated.status);
        setConfirmedRescuer(updated.confirmed_by_rescuer);
        setConfirmedAdopter(updated.confirmed_by_adopter);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEvidencePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (isRescuer && !evidenceFile) return;
    setConfirming(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};

    if (isRescuer) {
      if (evidenceFile) {
        const ext = evidenceFile.name.split(".").pop();
        const path = `adoption-evidence/${requestId}/rescuer.${ext}`;
        await supabase.storage.from("pet-photos").upload(path, evidenceFile, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(path);
        updates.rescuer_photo_url = publicUrl;
      }
      updates.confirmed_by_rescuer = true;
    } else {
      updates.confirmed_by_adopter = true;
    }

    await supabase.from("adoption_requests").update(updates).eq("id", requestId);

    const newConfirmedRescuer = isRescuer ? true : confirmedRescuer;
    const newConfirmedAdopter = isRescuer ? confirmedAdopter : true;

    if (newConfirmedRescuer && newConfirmedAdopter) {
      await supabase.from("adoption_requests").update({
        status: "completada",
        completed_at: new Date().toISOString(),
      }).eq("id", requestId);

      await supabase.from("pets").update({ status: "adoptado" }).eq("id", petId);
      setReqStatus("completada");
    }

    if (isRescuer) setConfirmedRescuer(true);
    else setConfirmedAdopter(true);

    setShowConfirmPanel(false);
    setConfirming(false);
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="container mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/chat")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{otherUserName}</h2>
            <p className="text-xs text-muted-foreground">Sobre la adopcion de {petName}</p>
          </div>
        </div>
      </div>

      {/* Banner de adopcion completada */}
      {isCompleted && (
        <div className="border-b bg-green-50 px-4 py-3">
          <div className="container mx-auto flex max-w-2xl items-center justify-center gap-2 text-green-700">
            <PartyPopper className="h-5 w-5" />
            <p className="font-semibold">¡Adopcion completada exitosamente!</p>
            <PartyPopper className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Panel de confirmacion */}
      {!isCompleted && reqStatus === "aceptada" && (
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="container mx-auto max-w-2xl">
            {!myConfirmed && !showConfirmPanel && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {otherConfirmed
                    ? `${otherUserName} ya confirmó. ¡Tu turno!`
                    : "¿Ya realizaron la entrega?"}
                </p>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowConfirmPanel(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar entrega
                </Button>
              </div>
            )}

            {myConfirmed && !isCompleted && (
              <p className="text-center text-sm text-muted-foreground">
                ✓ Confirmaste la entrega. Esperando confirmacion de {otherUserName}...
              </p>
            )}

            {showConfirmPanel && (
              <div className="space-y-3 rounded-lg border bg-background p-4">
                <p className="font-medium">Confirmar adopcion de {petName}</p>

                {isRescuer && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Sube una foto como evidencia de la entrega:</p>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed p-3 hover:border-primary hover:bg-primary/5">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {evidenceFile ? evidenceFile.name : "Seleccionar foto"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleEvidenceChange} />
                    </label>
                    {evidencePreview && (
                      <img src={evidencePreview} alt="Evidencia" className="h-32 w-32 rounded-lg object-cover" />
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={confirming || (isRescuer && !evidenceFile)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {confirming ? "Confirmando..." : "Sí, confirmar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowConfirmPanel(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="container mx-auto max-w-2xl space-y-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Inicia la conversacion para coordinar la adopcion.
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="container mx-auto flex max-w-2xl gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isCompleted ? "Adopcion completada" : "Escribe un mensaje..."}
            disabled={isCompleted}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
          />
          <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim() || sending || isCompleted}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
