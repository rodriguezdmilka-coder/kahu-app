"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import type { UserRole } from "@/lib/types";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<UserRole>("adoptante");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    city: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          city: formData.city,
          role,
        });

      if (profileError) {
        setError("Error al crear perfil: " + profileError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Registro error:", err);
      setError("Error inesperado: " + msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <PawPrint className="mx-auto mb-2 h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de rol */}
            <div className="space-y-2">
              <Label>Quiero ser</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "adoptante" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setRole("adoptante")}
                >
                  Adoptante
                </Button>
                <Button
                  type="button"
                  variant={role === "rescatista" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setRole("rescatista")}
                >
                  Rescatista
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {role === "adoptante"
                  ? "Busco adoptar una mascota"
                  : "Tengo mascotas para dar en adopcion"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Ej: Ciudad de Mexico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: 55 1234 5678"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesion
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
