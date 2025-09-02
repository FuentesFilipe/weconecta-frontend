import { SearchBox } from "@/components/ui/searchbox";

export default function QuestionariosPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm sticky top-0 h-screen">
        {/* Conteúdo da sidebar */}
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 bg-gray-50 flex flex-col items-start overflow-y-auto">
        <div className="w-full max-w-7xl px-6">
          {/* Cabeçalho da página */}
          <div className="py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Questionários</h1>
          </div>

          {/* Bloco branco */}
          <div className="bg-white rounded-lg shadow-sm mt-8">
            {/* Grid */}
            <div 
              className="grid grid-cols-[1fr_auto] items-start gap-x-4 p-4"
              style={{ gridTemplateRows: 'min-content min-content' }}
            >
              {/* Título "Busca" */}
              <h2 className="text-md font-semibold text-[#FF894E]">
                Busca
              </h2>

              {/* Botão */}
              <button 
                className="bg-[#FF894E] text-white text-xs px-10 py-2.5 rounded-md hover:opacity-90 h-min"
                style={{ gridRow: 'span 2', alignSelf: 'center' }}
              >
                Novo questionário
              </button>

              {/* SearchBox */}
              <div className="mt-0"> 
                <SearchBox 
                  placeholder="Procure por um questionário"
                  variant="orange"
                  size="xs"
                  width="medium"
                />
              </div>
            </div>

            {/* Linha separadora */}
            <div className="border-b border-gray-200 mx-4"></div>

            {/* Grid de cards */}
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-[#FF894E] rounded-lg p-4 text-center text-[#FF894E] h-52"
                  >
                    Card {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}








