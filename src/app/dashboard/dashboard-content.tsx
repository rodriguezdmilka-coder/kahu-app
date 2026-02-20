"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, ClipboardList, MessageCircle, Plus, LogOut, Heart } from "lucide-react";
import type { Profile } from "@/lib/types";

export function DashboardContent({ profile }: { profile: Profile }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isRescuer = profile.role === "rescatista";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {profile.full_name}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {profile.role} &middot; {profile.city}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isRescuer && (
          <>
            <Link href="/dashboard/mascotas">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <PawPrint className="h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">Mis mascotas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Administra las mascotas que tienes en adopcion.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/mascotas/nueva">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Plus className="h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">Publicar mascota</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Agrega una nueva mascota para darla en adopcion.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </>
        )}

        <Link href="/dashboard/solicitudes">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-lg">Solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isRescuer
                  ? "Revisa solicitudes de adopcion recibidas."
                  : "Ve el estado de tus solicitudes de adopcion."}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/chat">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              <CardTitle className="text-lg">Mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chatea para coordinar entregas de adopcion.
              </p>
            </CardContent>
          </Card>
        </Link>

        {!isRescuer && (
          <Link href="/dashboard/favoritos">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Favoritos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Las mascotas que guardaste como favoritas.
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
