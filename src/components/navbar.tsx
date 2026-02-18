"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PawPrint } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

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
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar sesion
            </Button>
          </Link>
          <Link href="/registro">
            <Button size="sm">Registrarse</Button>
          </Link>
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
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Iniciar sesion
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setOpen(false)}>
                <Button className="w-full">Registrarse</Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
