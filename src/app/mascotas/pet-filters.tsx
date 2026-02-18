"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function PetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ciudad, setCiudad] = useState(searchParams.get("ciudad") || "");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/mascotas?${params.toString()}`);
  };

  const clearFilters = () => {
    setCiudad("");
    router.push("/mascotas");
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        value={searchParams.get("especie") || "todos"}
        onValueChange={(val) => updateFilters("especie", val)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Especie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas</SelectItem>
          <SelectItem value="perro">Perros</SelectItem>
          <SelectItem value="gato">Gatos</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("tamano") || "todos"}
        onValueChange={(val) => updateFilters("tamano", val)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Tamano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="pequeno">Pequeno</SelectItem>
          <SelectItem value="mediano">Mediano</SelectItem>
          <SelectItem value="grande">Grande</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Buscar por ciudad..."
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilters("ciudad", ciudad);
          }}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateFilters("ciudad", ciudad)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
