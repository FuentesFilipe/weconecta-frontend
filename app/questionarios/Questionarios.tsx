'use client';

import { AppSidebar } from "@/components/AppSidebar";
import { CardContainer } from "@/components/Card/Card";
import { NovoQuestionarioModal } from "@/components/Modal/NovoQuestionarioModal";
import { SearchBox } from "@/components/ui/searchbox";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";

export default function QuestionariosPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AppSidebar />
      </div>

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
              <NovoQuestionarioModal
                trigger={
                  <button
                    className="bg-[#FF894E] text-white text-xs px-10 py-2.5 rounded-md hover:opacity-90 h-min"
                    style={{ gridRow: 'span 2', alignSelf: 'center' }}
                  >
                    Novo questionário
                  </button>
                }
                onConfirm={(data) => {
                  console.log("Novo questionário criado:", data);
                }}
              />

              {/* SearchBox */}
              <div className="mt-0">
                <SearchBox
                  placeholder="Procure por um questionário"
                  variant="orange"
                  size="xs"
                  width="medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Linha separadora */}
            <div className="border-b border-gray-200 mx-4"></div>

            {/* Grid de cards */}
            <div className="p-4">
              <CardContainer searchTerm={searchTerm}/>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}