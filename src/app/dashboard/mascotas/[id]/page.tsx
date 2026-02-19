"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Pet } from "@/lib/types";
import { ESTADOS, ESTADOS_CIUDADES } from "@/lib/mexico-locations";

export default function EditarMascotaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [pet, setPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age_months: "",
    sex: "",
    size: "",
    description: "",
    state: "",
    city: "",
    status: "",
    recovery_fee: false,
    vaccinated: false,
    sterilized: false,
  });

  const ciudades = formData.state ? (ESTADOS_CIUDADES[formData.state] ?? []) : [];

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setPet(data);
        setFormData({
          name: data.name,
          species: data.species,
          breed: data.breed || "",
          age_months: data.age_months.toString(),
          sex: data.sex,
          size: data.size,
          description: data.description,
          state: data.state || "",
          city: data.city,
          status: data.status,
          recovery_fee: data.recovery_fee ?? false,
          vaccinated: data.vaccinated ?? false,
          sterilized: data.sterilized ?? false,
        });
      }
    };
    load();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("pets")
      .update({
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age_months: parseInt(formData.age_months),
        sex: formData.sex,
        size: formData.size,
        description: formData.description,
        state: formData.state,
        city: formData.city,
        status: formData.status,
        recovery_fee: formData.recovery_fee,
        vaccinated: formData.vaccinated,
        sterilized: formData.sterilized,
      })
      .eq("id", params.id);

    if (updateError) {
      setError("Error al actualizar: " + updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/mascotas");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Estas seguro de que quieres eliminar esta mascota?")) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("pets").delete().eq("id", params.id);
    router.push("/dashboard/mascotas");
    router.refresh();
  };

  if (!pet) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Editar mascota</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Estatus de adopcion</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="adoptado">Adoptado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="age_months">Edad (meses)</Label>
                <Input
                  id="age_months"
                  name="age_months"
                  type="number"
                  min="1"
                  required
                  value={formData.age_months}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={formData.sex} onValueChange={(val) => setFormData({ ...formData, sex: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamaño</Label>
                <Select value={formData.size} onValueChange={(val) => setFormData({ ...formData, size: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Pequeño (hasta 10 kg)</SelectItem>
                    <SelectItem value="mediano">Mediano (11–25 kg)</SelectItem>
                    <SelectItem value="grande">Grande (26–45 kg)</SelectItem>
                    <SelectItem value="gigante">Gigante (más de 45 kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza (opcional)</Label>
              <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) => setFormData({ ...formData, state: val, city: "" })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => setFormData({ ...formData, city: val })}
                  disabled={!formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.state ? "Seleccionar ciudad" : "Elige estado primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad} value={ciudad}>{ciudad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Salud</Label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={formData.vaccinated}
                    onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">Vacunas al día</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={formData.sterilized}
                    onChange={(e) => setFormData({ ...formData, sterilized: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">Esterilizado/a</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿Tiene cuota de recuperación?</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, recovery_fee: true })}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    formData.recovery_fee
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, recovery_fee: false })}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    !formData.recovery_fee
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
