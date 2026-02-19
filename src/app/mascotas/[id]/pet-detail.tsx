"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Calendar, Heart, ArrowLeft, User, Check, X } from "lucide-react";
import type { Pet, Profile } from "@/lib/types";

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  let text = `${years} ${years === 1 ? "año" : "años"}`;
  if (remaining > 0) text += ` ${remaining} m`;
  return text;
}

function formatSize(size: string): string {
  const map: Record<string, string> = {
    pequeno: "Pequeño (hasta 10 kg)",
    mediano: "Mediano (11–25 kg)",
    grande: "Grande (26–45 kg)",
    gigante: "Gigante (más de 45 kg)",
  };
  return map[size] ?? size;
}

/* ── Componente de opción única ── */
function SingleChoice({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
            value === opt
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ── Componente de opción múltiple ── */
function MultiChoice({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]
    );
  };
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
            values.includes(opt)
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

interface FormAnswers {
  housing_type: string;
  outdoor_space: string;
  people_count: string;
  hours_alone: string;
  has_children: string;
  pet_experience: string;
  pets_vaccinated: string;
  travel_plan: string;
  return_circumstances: string[];
  motivation: string;
}

const EMPTY: FormAnswers = {
  housing_type: "",
  outdoor_space: "",
  people_count: "",
  hours_alone: "",
  has_children: "",
  pet_experience: "",
  pets_vaccinated: "",
  travel_plan: "",
  return_circumstances: [],
  motivation: "",
};

function isComplete(f: FormAnswers) {
  return (
    f.housing_type &&
    f.outdoor_space &&
    f.people_count &&
    f.hours_alone &&
    f.has_children &&
    f.pet_experience &&
    f.pets_vaccinated &&
    f.travel_plan &&
    f.return_circumstances.length > 0 &&
    f.motivation.trim()
  );
}

/* ── Health badge ── */
function HealthItem({ ok, labelOk, labelNo }: { ok: boolean; labelOk: string; labelNo: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-3 w-3" />
        </span>
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <X className="h-3 w-3" />
        </span>
      )}
      <span>{ok ? labelOk : labelNo}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

export function PetDetail({ pet, rescuerName }: { pet: Pet; rescuerName: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormAnswers>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const set = <K extends keyof FormAnswers>(key: K, value: FormAnswers[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAuthChecked(true); return; }

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      setUserProfile(profile);

      const { data: existing } = await supabase
        .from("adoption_requests")
        .select("id")
        .eq("adopter_id", user.id)
        .eq("pet_id", pet.id)
        .maybeSingle();
      if (existing) setSubmitted(true);

      setAuthChecked(true);
    });
  }, [pet.id]);

  const handleSubmit = async () => {
    if (!userProfile || !isComplete(form)) return;
    setLoading(true);

    const message = JSON.stringify({
      "Vivienda": form.housing_type,
      "Espacio exterior": form.outdoor_space,
      "Personas en casa": form.people_count,
      "Horas solo en casa": form.hours_alone,
      "Niños menores de 10 años": form.has_children,
      "Experiencia con mascotas": form.pet_experience,
      "Mascotas actuales esterilizadas/vacunadas": form.pets_vaccinated,
      "Cuidado durante viajes": form.travel_plan,
      "Devolvería al animal si": form.return_circumstances,
      "Motivación": form.motivation.trim(),
    });

    const supabase = createClient();
    const { error } = await supabase.from("adoption_requests").insert({
      adopter_id: userProfile.id,
      pet_id: pet.id,
      message,
    });

    if (!error) {
      setSubmitted(true);
      setDialogOpen(false);
    }
    setLoading(false);
  };

  const photoUrl = pet.photos?.[0] || "/placeholder-pet.svg";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Foto */}
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          <img src={photoUrl} alt={pet.name} className="h-full w-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">

          {/* Nombre */}
          <h1 className="text-3xl font-bold">{pet.name}</h1>

          {/* Ubicación */}
          {(pet.city || pet.state) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                {[pet.city, pet.state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {/* Edad · Sexo · Tamaño */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatAge(pet.age_months)}
            </span>
            <span>·</span>
            <span className="capitalize">{pet.sex}</span>
            <span>·</span>
            <span>{formatSize(pet.size)}</span>
          </div>

          {/* Raza */}
          {pet.breed && (
            <p className="text-sm">
              <span className="font-medium">Raza:</span> {pet.breed}
            </p>
          )}

          {/* Sobre la mascota */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">Sobre {pet.name}</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {pet.description}
            </p>
          </div>

          {/* Salud */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-3 font-semibold">Salud</h2>
            <div className="space-y-2">
              <HealthItem
                ok={pet.sterilized}
                labelOk="Esterilizado/a"
                labelNo="Compromiso de esterilización"
              />
              <HealthItem
                ok={pet.vaccinated}
                labelOk="Vacunas al día"
                labelNo="Faltan vacunas"
              />
            </div>
          </div>

          {/* Publicado por */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Publicado por {rescuerName}</span>
          </div>

          {/* Botón de adopción */}
          {pet.status !== "disponible" ? (
            <div className="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
              {pet.status === "en_proceso" ? "En proceso de adopción" : "Ya fue adoptado"}
            </div>
          ) : !authChecked ? (
            <Button size="lg" className="w-full" disabled>Cargando...</Button>
          ) : submitted ? (
            <div className="rounded-lg border bg-primary/5 p-4 text-center">
              <p className="font-medium text-primary">Solicitud enviada</p>
              <p className="text-sm text-muted-foreground">El rescatista revisará tu solicitud.</p>
            </div>
          ) : !userProfile ? (
            <div className="space-y-2">
              <Link href="/login">
                <Button size="lg" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Inicia sesión para adoptar
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="underline">Regístrate aquí</Link>
              </p>
            </div>
          ) : userProfile.role === "rescatista" ? (
            <p className="text-sm text-muted-foreground">
              Como rescatista no puedes solicitar adopciones.
            </p>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Solicitar adopción
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Solicitar adopción de {pet.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Cuéntanos un poco sobre ti. Son 9 preguntas rápidas.
                  </p>
                </DialogHeader>

                <div className="space-y-6 pb-2">
                  <Section title="Tu hogar">
                    <div className="space-y-2">
                      <Label>¿Dónde vives?</Label>
                      <SingleChoice
                        options={["Casa propia", "Casa rentada (con permiso para mascotas)", "Departamento propio", "Departamento rentado (con permiso para mascotas)"]}
                        value={form.housing_type}
                        onChange={(v) => set("housing_type", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>¿Tienes espacio exterior?</Label>
                      <SingleChoice
                        options={["Jardín/patio cercado", "Jardín/patio sin cercar", "Solo terraza o balcón", "Sin espacio exterior"]}
                        value={form.outdoor_space}
                        onChange={(v) => set("outdoor_space", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>¿Cuántas personas viven contigo?</Label>
                      <SingleChoice
                        options={["Vivo solo/a", "1–2 personas", "3–4 personas", "5 o más personas"]}
                        value={form.people_count}
                        onChange={(v) => set("people_count", v)}
                      />
                    </div>
                  </Section>

                  <Section title="Tu rutina">
                    <div className="space-y-2">
                      <Label>¿Cuántas horas al día suele haber alguien en casa?</Label>
                      <SingleChoice
                        options={["Casi siempre hay alguien", "La mascota estaría sola 4–8 horas", "La mascota estaría sola más de 8 horas", "Varía mucho"]}
                        value={form.hours_alone}
                        onChange={(v) => set("hours_alone", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>¿Hay niños menores de 10 años en casa?</Label>
                      <SingleChoice
                        options={["Sí", "No"]}
                        value={form.has_children}
                        onChange={(v) => set("has_children", v)}
                      />
                    </div>
                  </Section>

                  <Section title="Experiencia con mascotas">
                    <div className="space-y-2">
                      <Label>¿Has tenido mascotas antes?</Label>
                      <SingleChoice
                        options={["Sí, actualmente tengo", "Sí, tuve antes", "No, sería mi primera mascota"]}
                        value={form.pet_experience}
                        onChange={(v) => set("pet_experience", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Si tienes mascotas actualmente, ¿están esterilizadas y vacunadas?</Label>
                      <SingleChoice
                        options={["Sí", "No", "No tengo mascotas actualmente"]}
                        value={form.pets_vaccinated}
                        onChange={(v) => set("pets_vaccinated", v)}
                      />
                    </div>
                  </Section>

                  <Section title="Compromiso">
                    <div className="space-y-2">
                      <Label>¿Qué harías con la mascota cuando viajes?</Label>
                      <SingleChoice
                        options={["La dejo con familiar o amigo", "La llevo a guardería/hotel", "Alguien la cuida en casa", "Aún no lo he pensado"]}
                        value={form.travel_plan}
                        onChange={(v) => set("travel_plan", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        ¿En qué circunstancias considerarías devolver al animal?{" "}
                        <span className="text-muted-foreground">(puedes elegir varias)</span>
                      </Label>
                      <MultiChoice
                        options={["Problemas graves de comportamiento", "Alergia de alguien en casa", "Cambio de vivienda que no permite mascotas", "No la devolvería bajo ninguna circunstancia"]}
                        values={form.return_circumstances}
                        onChange={(v) => set("return_circumstances", v)}
                      />
                    </div>
                  </Section>

                  <Section title="Motivación">
                    <div className="space-y-2">
                      <Label>¿Por qué quieres adoptar a {pet.name}?</Label>
                      <Textarea
                        value={form.motivation}
                        onChange={(e) => {
                          if (e.target.value.length <= 300) set("motivation", e.target.value);
                        }}
                        placeholder="Cuéntanos brevemente tu motivación..."
                        rows={3}
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {form.motivation.length}/300
                      </p>
                    </div>
                  </Section>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !isComplete(form)}
                    className="w-full"
                  >
                    {loading ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
