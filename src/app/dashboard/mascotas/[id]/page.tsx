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
    city: "",
    status: "",
  });

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
          city: data.city,
          status: data.status,
        });
      }
    };
    load();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
        city: formData.city,
        status: formData.status,
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
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1"
        onClick={() => router.back()}
      >
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
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Select
                  value={formData.sex}
                  onValueChange={(val) =>
                    setFormData({ ...formData, sex: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamano</Label>
                <Select
                  value={formData.size}
                  onValueChange={(val) =>
                    setFormData({ ...formData, size: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="mediano">Mediano</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza (opcional)</Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
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
              />
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
