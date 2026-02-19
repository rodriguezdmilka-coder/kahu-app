"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ESTADOS, ESTADOS_CIUDADES } from "@/lib/mexico-locations";

function FilterSelect({
  label,
  paramKey,
  options,
  disabled = false,
  placeholder = "Todos",
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) || "";

  const update = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(paramKey, val);
    } else {
      params.delete(paramKey);
    }
    // Si cambia el estado, limpia la ciudad
    if (paramKey === "estado") {
      params.delete("ciudad");
    }
    router.push(`/mascotas?${params.toString()}`);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      <Select value={value} onValueChange={update} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estadoSeleccionado = searchParams.get("estado") || "";
  const hasFilters = searchParams.toString().length > 0;

  const ciudades = estadoSeleccionado
    ? (ESTADOS_CIUDADES[estadoSeleccionado] ?? []).map((c) => ({ value: c, label: c }))
    : [];

  return (
    <div className="mb-8 space-y-3">
      {/* Fila 1: Especie | Tamaño | Edad | Sexo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FilterSelect
          label="Especie"
          paramKey="especie"
          options={[
            { value: "perro", label: "Perro" },
            { value: "gato", label: "Gato" },
          ]}
        />
        <FilterSelect
          label="Tamaño"
          paramKey="tamano"
          options={[
            { value: "pequeno", label: "Pequeño (hasta 10 kg)" },
            { value: "mediano", label: "Mediano (11–25 kg)" },
            { value: "grande", label: "Grande (26–45 kg)" },
            { value: "gigante", label: "Gigante (más de 45 kg)" },
          ]}
        />
        <FilterSelect
          label="Edad"
          paramKey="edad"
          options={[
            { value: "cachorro", label: "Cachorro (menos de 1 año)" },
            { value: "joven", label: "Joven (1 a 4 años)" },
            { value: "adulto", label: "Adulto (4 a 9 años)" },
            { value: "senior", label: "Senior (más de 9 años)" },
          ]}
        />
        <FilterSelect
          label="Sexo"
          paramKey="sexo"
          options={[
            { value: "macho", label: "Macho" },
            { value: "hembra", label: "Hembra" },
          ]}
        />
      </div>

      {/* Fila 2: Cuota | Estado | Ciudad */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Cuota de recuperación"
          paramKey="cuota"
          options={[
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
          ]}
        />
        <FilterSelect
          label="Estado"
          paramKey="estado"
          placeholder="Todos"
          options={ESTADOS.map((e) => ({ value: e, label: e }))}
        />
        <FilterSelect
          label="Ciudad"
          paramKey="ciudad"
          placeholder={estadoSeleccionado ? "Todas" : "Elige estado primero"}
          options={ciudades}
          disabled={!estadoSeleccionado}
        />
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/mascotas")}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
