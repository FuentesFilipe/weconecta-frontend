import { SearchBox } from "@/components/ui/searchbox";
import { Button } from "../components/Button";

export function HomePage() {
    return (
        <div className="w-full">


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
                    <div className="button-wrapper" style={{ alignContent: 'flex-end', display: 'flex', height: 'auto' }}>
                        <Button>
                            <span>Novo questionário</span>
                        </Button>
                    </div>

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

    );
}








