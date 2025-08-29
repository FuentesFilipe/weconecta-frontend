"use client";

import { useState } from "react";
import { SearchBox } from "@/components/ui/searchbox";

export function SearchBoxComponent() {
  const [search, setSearch] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Valor da busca:", search);
    // Aqui você poderia chamar uma API, filtrar uma lista, etc
  };

  return (
    <div className="flex flex-col gap-2">
      <SearchBox
        placeholder="Digite para buscar..."
        value={search}
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Buscar</button>
    </div>
  );
}


