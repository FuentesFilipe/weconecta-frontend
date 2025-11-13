'use client';

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from '@xyflow/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export function useCanvasOperations() {
    const { fitView } = useReactFlow();
    const searchParams = useSearchParams();

    const surveyId = parseInt(searchParams.get('id') as string, 10);
    // Funções de localStorage
    const saveToLocalStorage = useCallback(
        (nodesData: any[], edgesData: any[]) => {
            try {
                const loadedNodes = JSON.parse(
                    localStorage.getItem('weconnecta-canva-nodes') || '{}',
                );
                const loadedEdges = JSON.parse(
                    localStorage.getItem('weconnecta-canva-edges') || '{}',
                );

                localStorage.setItem(
                    'weconnecta-canva-nodes',
                    JSON.stringify({
                        ...loadedNodes,
                        [surveyId!]: nodesData,
                    }),
                );
                localStorage.setItem(
                    'weconnecta-canva-edges',
                    JSON.stringify({
                        ...loadedEdges,
                        [surveyId!]: edgesData,
                    }),
                );
            } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
            }
        },
        [],
    );

    const loadFromLocalStorage = useCallback(() => {
        try {
            const savedNodes = localStorage.getItem('weconnecta-canva-nodes');
            const savedEdges = localStorage.getItem('weconnecta-canva-edges');

            if (savedNodes && savedEdges) {
                const parsedNodes = JSON.parse(savedNodes || '{}');
                const parsedEdges = JSON.parse(savedEdges || '{}');
                
                // Verifica se os dados existem e são arrays válidos
                if (
                    parsedNodes[surveyId!] &&
                    parsedEdges[surveyId!] &&
                    Array.isArray(parsedNodes[surveyId!]) &&
                    Array.isArray(parsedEdges[surveyId!])
                ) {
                return {
                        nodes: parsedNodes[surveyId!],
                        edges: parsedEdges[surveyId!],
                };
                }
            }
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
        }
        return null;
    }, [surveyId]);

    // Estado dos nós e arestas
    const savedData = loadFromLocalStorage();
    const [nodes, setNodes] = useState(() => {
        const initialNodes = savedData?.nodes;
        return Array.isArray(initialNodes) ? initialNodes : [];
    });
    const [edges, setEdges] = useState(() => {
        const initialEdges = savedData?.edges;
        return Array.isArray(initialEdges) ? initialEdges : [];
    });

    // Organização do canvas
    const organizeCanvas = useCallback(() => {
        console.log('Organizando canvas em formato de árvore...');

        const NODE_WIDTH = 200;
        const NODE_HEIGHT = 100;
        const LEVEL_HEIGHT = 200;
        const SIBLING_SPACING = 250;

        const rootNodes = nodes.filter(
            (node: any) => !edges.some((edge: any) => edge.target === node.id),
        );

        console.log('Nós raiz encontrados:', rootNodes);

        if (rootNodes.length === 0) {
            console.log('Nenhum nó raiz encontrado, usando primeiro nó');
            if (nodes.length > 0) {
                rootNodes.push(nodes[0]);
            }
        }

        const positionedNodes = new Map();

        const positionLeafNodes = (
            nodeId: string,
            level: number,
            siblingIndex: number,
            parentX: number = 0,
        ) => {
            const node = nodes.find((n: any) => n.id === nodeId);
            if (!node) return;

            const children = edges
                .filter((edge: any) => edge.source === nodeId)
                .map((edge: any) => edge.target);

            let x, y;

            if (children.length === 0) {
                x = parentX + siblingIndex * SIBLING_SPACING;
                y = level * LEVEL_HEIGHT;
                positionedNodes.set(nodeId, { x, y });
            } else {
                children.forEach((childId: string, index: number) => {
                    positionLeafNodes(childId, level + 1, index, parentX);
                });
            }
        };

        const positionParentNodes = (nodeId: string) => {
            const node = nodes.find((n: any) => n.id === nodeId);
            if (!node) return;

            const children = edges
                .filter((edge: any) => edge.source === nodeId)
                .map((edge: any) => edge.target);

            if (children.length > 0) {
                children.forEach((childId: any) =>
                    positionParentNodes(childId),
                );

                const childPositions = children
                    .map((childId: any) => positionedNodes.get(childId))
                    .filter(Boolean);

                if (childPositions.length > 0) {
                    const minX = Math.min(
                        ...childPositions.map((pos: any) => pos.x),
                    );
                    const maxX = Math.max(
                        ...childPositions.map((pos: any) => pos.x),
                    );
                    const centerX = (minX + maxX) / 2;

                    const parentLevel =
                        Math.min(...childPositions.map((pos: any) => pos.y)) -
                        LEVEL_HEIGHT;

                    positionedNodes.set(nodeId, { x: centerX, y: parentLevel });
                }
            }
        };

        const positionRootNodes = () => {
            rootNodes.forEach((rootNode: any, index: number) => {
                const startX = index * SIBLING_SPACING * 3;

                const children = edges
                    .filter((edge: any) => edge.source === rootNode.id)
                    .map((edge: any) => edge.target);

                children.forEach((childId: string, childIndex: number) => {
                    positionLeafNodes(childId, 1, childIndex, startX);
                });

                positionParentNodes(rootNode.id);

                if (children.length === 0) {
                    positionedNodes.set(rootNode.id, { x: startX, y: 0 });
                }
            });
        };

        positionRootNodes();

        const updatedNodes = nodes.map((node: any) => {
            const newPosition = positionedNodes.get(node.id);
            if (newPosition) {
                return {
                    ...node,
                    position: newPosition,
                };
            }
            return node;
        });

        setNodes(updatedNodes);
        saveToLocalStorage(updatedNodes, edges);

        setTimeout(() => {
            fitView({ padding: 0.1, duration: 800 });
        }, 100);

        console.log('Canvas organizado em formato de árvore!');
    }, [nodes, edges, fitView, saveToLocalStorage]);

    // Handlers de mudança
    const onNodesChange = useCallback(
        (changes: any) =>
            setNodes((nodesSnapshot: any) =>
                applyNodeChanges(changes, nodesSnapshot),
            ),
        [],
    );

    const onEdgesChange = useCallback(
        (changes: any) => {
            const newEdges = applyEdgeChanges(changes, edges);
            setEdges(newEdges);
            saveToLocalStorage(nodes, newEdges);
            console.log('🔗 Conexões atualizadas:', changes);
        },
        [nodes, edges, saveToLocalStorage],
    );

    const onConnect = useCallback(
        (params: any) => {
            const newEdges = addEdge(params, edges);
            setEdges(newEdges);
            saveToLocalStorage(nodes, newEdges);
            console.log('🔗 Nova conexão criada:', params);
        },
        [nodes, edges, saveToLocalStorage],
    );

    return {
        nodes,
        setNodes,
        edges,
        setEdges,
        saveToLocalStorage,
        loadFromLocalStorage,
        organizeCanvas,
        onNodesChange,
        onEdgesChange,
        onConnect,
    };
}
