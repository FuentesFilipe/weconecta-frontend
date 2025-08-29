import { SearchBox } from "@/components/ui/searchbox";

export default function Home() {
  return (
    <div className="p-6">
      <h5 className="text-sm font-semibold mb-1 text-[#FF894E]">Busca</h5>
      <SearchBox 
        placeholder="Procure por um questionário"
        variant="orange"
        size="xs"
      />
    </div>
  );
}
