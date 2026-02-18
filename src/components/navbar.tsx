"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PawPrint, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Kahu</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/mascotas"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Mascotas
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Mi panel
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesion
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 pt-8">
              <Link
                href="/mascotas"
                onClick={() => setOpen(false)}
                className="text-lg font-medium"
              >
                Mascotas
              </Link>
              {user ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Mi panel
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Iniciar sesion
                    </Button>
                  </Link>
                  <Link href="/registro" onClick={() => setOpen(false)}>
                    <Button className="w-full">Registrarse</Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
