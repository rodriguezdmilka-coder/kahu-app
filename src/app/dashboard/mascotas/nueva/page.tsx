"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Upload, X } from "lucide-react";

export default function NuevaMascotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age_months: "",
    sex: "",
    size: "",
    description: "",
    city: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 4) {
      setError("Maximo 4 fotos");
      return;
    }
    setPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Debes iniciar sesion");
      setLoading(false);
      return;
    }

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(path, file);

      if (uploadError) {
        setError("Error al subir foto: " + uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("pet-photos").getPublicUrl(path);
      photoUrls.push(publicUrl);
    }

    const { error: insertError } = await supabase.from("pets").insert({
      name: formData.name,
      species: formData.species,
      breed: formData.breed || null,
      age_months: parseInt(formData.age_months),
      sex: formData.sex,
      size: formData.size,
      description: formData.description,
      photos: photoUrls,
      city: formData.city,
      rescuer_id: user.id,
    });

    if (insertError) {
      setError("Error al publicar: " + insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/mascotas");
    router.refresh();
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Publicar mascota en adopcion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la mascota</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Luna"
                />
              </div>

              <div className="space-y-2">
                <Label>Especie</Label>
                <Select
                  value={formData.species}
                  onValueChange={(val) =>
                    setFormData({ ...formData, species: val })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perro">Perro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
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
                  placeholder="Ej: 12"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(val) =>
                    setFormData({ ...formData, sex: val })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                placeholder="Ej: Labrador, Mestizo..."
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
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Cuenta sobre la personalidad, si esta vacunado, esterilizado, etc."
                rows={4}
              />
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label>Fotos (max 4)</Label>
              <div className="grid grid-cols-4 gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photoFiles.length < 4 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Publicando..." : "Publicar mascota"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
