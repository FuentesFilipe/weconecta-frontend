import type { SurveyGraphPayload } from '@/dtos/SurveyConnectionDto';
import { SurveyElementType } from '@/dtos/SurveysElementsDto';

export type CanvasNode = {
    id: string,
    type: 'customNode',
    position: { x: number, y: number};
    data: {
        label: string,
        type: 'mensagem' | 'alternativa' | 'input' | 'fim';
        maxEdges?: number;
        onClick?: () => void;
        onDoubleClick?: () => void;
        onDelete?: () => void;
    };
};

export type CanvasEdge = { id: string; source: string; target: string; label?: string};

export function toCanvasModel(payload: SurveyGraphPayload): { nodes: CanvasNode[]; edges: CanvasEdge[]} {
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];

    //grade simples para os elementos
    const elPos = (i: number) => ({ x:120 + (i %3) * 320, y: 80 + Math.floor(i/3) * 220});
    
    //nos dos elementos
    payload.elements.forEach((el, i) => {
        const typeMap = 
        el.type === SurveyElementType.MESSAGE ? 'fim' :
            el.type === SurveyElementType.INPUT ? 'input' : 'mensagem';

        nodes.push({
            id: String(el.id),
            type: 'customNode',
            position: elPos(i),
            data: {label: el.description, type: typeMap, maxEdges: 4}
        });

        //nos das alternativas desse elemento
        const base = elPos(i);
        // Filtra opções __DEFAULT__ e deletadas
        const validOptions = el.options?.filter(opt => 
            opt.id != null && 
            !opt.deletedAt && 
            opt.description !== '__DEFAULT__' && 
            opt.description !== 'N/A'
        ) || [];
        
        validOptions.forEach((opt, k) => {
            const optNodeId = `opt-${opt.id}`;
            nodes.push({
                id: optNodeId,
                type: 'customNode',
                position: { x: base.x + k * 220, y: base.y +150},
                data: {label: opt.description, type: 'alternativa', maxEdges: 1}
            });

            //aresta elemento -> alternativa
            edges.push({
                id: `e-${el.id}-${optNodeId}`,
                source: String(el.id),
                target: optNodeId
            });
        });
    });

    //mapa para procurar opcao -> nodeId
    const optNodeIdByOptionId = new Map<number, string>();
    for (const n of nodes){
        if (n.id.startsWith('opt-')) {
            const num = Number(n.id.slice(4));
            if (!Number.isNaN(num)) optNodeIdByOptionId.set(num, n.id);
        }
    }

    //aresta alternativas -> proximo elemento
    for (const c of payload.connections) {
        const optNodeId = optNodeIdByOptionId.get(c.optionId);
        if (!optNodeId || ! c.nextElementId) continue;
        edges.push({
            id: `e-${optNodeId}-${c.nextElementId}`,
            source: optNodeId,
            target: String(c.nextElementId)
        });
    }
    return { nodes, edges};
}