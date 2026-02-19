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
import { ESTADOS, ESTADOS_CIUDADES } from "@/lib/mexico-locations";

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
    state: "",
    city: "",
    recovery_fee: false,
    vaccinated: false,
    sterilized: false,
  });

  const ciudades = formData.state ? (ESTADOS_CIUDADES[formData.state] ?? []) : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Debes iniciar sesion");
      setLoading(false);
      return;
    }

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

      const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(path);
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
      state: formData.state,
      city: formData.city,
      recovery_fee: formData.recovery_fee,
      vaccinated: formData.vaccinated,
      sterilized: formData.sterilized,
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
                  onValueChange={(val) => setFormData({ ...formData, species: val })}
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
                  onValueChange={(val) => setFormData({ ...formData, sex: val })}
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
                <Label>Tamaño</Label>
                <Select
                  value={formData.size}
                  onValueChange={(val) => setFormData({ ...formData, size: val })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
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
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="Ej: Labrador, Mestizo..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) => setFormData({ ...formData, state: val, city: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
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
                  required
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
                    <img src={src} alt="" className="h-full w-full object-cover" />
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
