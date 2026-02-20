import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { count: adoptionsCount } = await supabase
    .from("adoption_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "completada");

  const { count: petsCount } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("status", "disponible");
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-8 text-center md:py-12">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-1 flex justify-center">
            <Image src="/logo-kahu.png" alt="Kahu" width={240} height={240} className="" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Encuentra a tu nuevo mejor amigo
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Conectamos rescatistas con personas que quieren darle un hogar a
            perros y gatos en Mexico.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/mascotas">
              <Button size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Ver mascotas en adopcion
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="gap-2">
                <Heart className="h-4 w-4" />
                Soy rescatista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estadisticas */}
      <section className="border-y bg-muted/40 px-4 py-10">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-2">
            <div>
              <p className="text-4xl font-bold text-primary">{adoptionsCount ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">Adopciones exitosas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{petsCount ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">Mascotas disponibles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Como funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  1. Busca una mascota
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explora nuestro catalogo de perros y gatos disponibles para
                  adopcion en tu ciudad.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  2. Solicita la adopcion
                </h3>
                <p className="text-sm text-muted-foreground">
                  Envia tu solicitud contandonos por que quieres adoptar. El
                  rescatista revisara tu perfil.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  3. Coordina la entrega
                </h3>
                <p className="text-sm text-muted-foreground">
                  Si tu solicitud es aceptada, se abre un chat para coordinar
                  los detalles de la adopcion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Rescatistas */}
      <section className="bg-primary/5 px-4 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">Eres rescatista?</h2>
          <p className="mb-6 text-muted-foreground">
            Publica las mascotas que tienes en adopcion y encuentra adoptantes
            responsables. Es gratis.
          </p>
          <Link href="/registro">
            <Button size="lg">Registrarme como rescatista</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/logo-kahu.png" alt="Kahu" width={24} height={24} className="" />
            <span className="font-medium">Kahu</span>
          </div>
          <p>Conectando mascotas con hogares en Mexico.</p>
        </div>
      </footer>
    </div>
  );
}
