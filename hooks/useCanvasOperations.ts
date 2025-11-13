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
        console.log('Organizando canvas em formato de árvore melhorado...');

        const NODE_WIDTH = 200;
        const NODE_HEIGHT = 100;
        const LEVEL_HEIGHT = 280; // Espaçamento vertical entre níveis
        const MIN_SIBLING_SPACING = 320; // Espaçamento horizontal mínimo entre irmãos
        const START_X = 0;

        if (nodes.length === 0) {
            return;
        }

        // Funções auxiliares
        const getParents = (nodeId: string): string[] => {
            return edges
                .filter((edge: any) => edge.target === nodeId)
                .map((edge: any) => edge.source);
        };

        const getChildren = (nodeId: string): string[] => {
            return edges
                .filter((edge: any) => edge.source === nodeId)
                .map((edge: any) => edge.target);
        };

        // Passo 1: Calcular níveis usando BFS otimizado
        const nodeLevels = new Map<string, number>();
        const rootNodes = nodes.filter(
            (node: any) => getParents(node.id).length === 0,
        );

        if (rootNodes.length === 0 && nodes.length > 0) {
            rootNodes.push(nodes[0]);
        } else if (nodes.length === 0) {
            return;
        }

        // Calcula níveis considerando múltiplos pais
        const calculateLevels = () => {
            const queue: Array<{ id: string; level: number }> = [];
            const processed = new Set<string>();
            
            rootNodes.forEach((root: any) => {
                nodeLevels.set(root.id, 0);
                queue.push({ id: root.id, level: 0 });
            });

            while (queue.length > 0) {
                const { id, level } = queue.shift()!;
                if (processed.has(id)) continue;
                processed.add(id);

                const children = getChildren(id);
                children.forEach((childId: string) => {
                    const parents = getParents(childId);
                    const maxParentLevel = Math.max(
                        ...parents.map((pid: string) => nodeLevels.get(pid) ?? -1),
                        level
                    );
                    const newLevel = maxParentLevel + 1;
                    const currentLevel = nodeLevels.get(childId) ?? -1;
                    
                    if (newLevel > currentLevel) {
                        nodeLevels.set(childId, newLevel);
                        queue.push({ id: childId, level: newLevel });
                    }
                });
            }
        };

        calculateLevels();

        // Garante nível para nós desconectados
        nodes.forEach((node: any) => {
            if (!nodeLevels.has(node.id)) {
                nodeLevels.set(node.id, 0);
            }
        });

        // Passo 2: Agrupar nós por nível
        const nodesByLevel = new Map<number, string[]>();
        nodeLevels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });

        const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);

        // Passo 3: Layout hierárquico melhorado com múltiplas passadas
        const finalPositions = new Map<string, { x: number; y: number }>();
        const nodeXPositions = new Map<string, number>();

        // Inicializa posições Y
        nodes.forEach((node: any) => {
            const level = nodeLevels.get(node.id) ?? 0;
            finalPositions.set(node.id, { x: 0, y: level * LEVEL_HEIGHT });
        });

        // Passada 1: Posiciona nós de cima para baixo baseado nos pais
        sortedLevels.forEach((level) => {
            const levelNodes = nodesByLevel.get(level)!;
            
            // Calcula posições ideais baseadas nos pais
            const idealPositions = new Map<string, number>();
            
            levelNodes.forEach((nodeId) => {
                const parents = getParents(nodeId);
                if (parents.length > 0) {
                    const parentXs = parents
                        .map((pid: string) => nodeXPositions.get(pid))
                        .filter((x): x is number => x !== undefined);
                    
                    if (parentXs.length > 0) {
                        const minX = Math.min(...parentXs);
                        const maxX = Math.max(...parentXs);
                        idealPositions.set(nodeId, (minX + maxX) / 2);
                    }
                }
            });

            // Ordena nós pela posição ideal
            levelNodes.sort((a, b) => {
                const idealA = idealPositions.get(a);
                const idealB = idealPositions.get(b);
                if (idealA !== undefined && idealB !== undefined) {
                    return idealA - idealB;
                }
                if (idealA !== undefined) return -1;
                if (idealB !== undefined) return 1;
                return 0;
            });

            // Posiciona nós do nível
            levelNodes.forEach((nodeId, index) => {
                const parents = getParents(nodeId);
                let targetX: number;

                if (parents.length > 0) {
                    const idealX = idealPositions.get(nodeId);
                    if (idealX !== undefined) {
                        targetX = idealX;
                    } else {
                        const parentXs = parents
                            .map((pid: string) => nodeXPositions.get(pid))
                            .filter((x): x is number => x !== undefined);
                        targetX = parentXs.length > 0 
                            ? parentXs.reduce((a, b) => a + b, 0) / parentXs.length
                            : START_X + index * MIN_SIBLING_SPACING;
                    }
                } else {
                    // Nós raiz: distribui uniformemente
                    const totalRoots = nodesByLevel.get(0)?.length ?? 1;
                    const spacing = Math.max(MIN_SIBLING_SPACING, 400);
                    targetX = START_X + index * spacing;
                }

                // Evita sobreposição
                const existing = levelNodes.slice(0, index);
                let finalX = targetX;
                
                existing.forEach((existingId) => {
                    const existingX = nodeXPositions.get(existingId);
                    if (existingX !== undefined) {
                        const minDist = MIN_SIBLING_SPACING;
                        if (finalX < existingX + minDist) {
                            finalX = existingX + minDist;
                        }
                    }
                });

                const pos = finalPositions.get(nodeId)!;
                pos.x = finalX;
                nodeXPositions.set(nodeId, finalX);
            });
        });

        // Passada 2: Ajusta espaçamento horizontal para evitar sobreposição
        let changed = true;
        let iterations = 0;
        const maxIterations = 15;

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            sortedLevels.forEach((level) => {
                const levelNodes = nodesByLevel.get(level)!;
                const sorted = levelNodes
                    .map((id) => ({ id, x: nodeXPositions.get(id) ?? 0 }))
                    .sort((a, b) => a.x - b.x);

                sorted.forEach((node, index) => {
                    if (index > 0) {
                        const prev = sorted[index - 1];
                        const minX = prev.x + MIN_SIBLING_SPACING;
                        const currentX = node.x;
                        
                        if (currentX < minX) {
                            node.x = minX;
                            nodeXPositions.set(node.id, minX);
                            const pos = finalPositions.get(node.id)!;
                            pos.x = minX;
                            changed = true;
                        }
                    }
                });
            });
        }

        // Passada 3: Centraliza pais acima dos filhos (bottom-up)
        [...sortedLevels].reverse().forEach((level) => {
            const levelNodes = nodesByLevel.get(level)!;
            
            levelNodes.forEach((nodeId) => {
                const children = getChildren(nodeId);
                if (children.length > 0) {
                    const childXs = children
                        .map((cid: string) => nodeXPositions.get(cid))
                        .filter((x): x is number => x !== undefined);
                    
                    if (childXs.length > 0) {
                        const minChildX = Math.min(...childXs);
                        const maxChildX = Math.max(...childXs);
                        const idealCenterX = (minChildX + maxChildX) / 2;
                        
                        const currentX = nodeXPositions.get(nodeId) ?? 0;
                        const diff = idealCenterX - currentX;
                        
                        // Ajusta se a diferença for pequena e não causar sobreposição
                        if (Math.abs(diff) < MIN_SIBLING_SPACING * 0.8) {
                            const newX = idealCenterX;
                            const levelNodesAtLevel = nodesByLevel.get(level)!;
                            let canMove = true;
                            
                            levelNodesAtLevel.forEach((otherId) => {
                                if (otherId !== nodeId) {
                                    const otherX = nodeXPositions.get(otherId) ?? 0;
                                    if (Math.abs(newX - otherX) < MIN_SIBLING_SPACING) {
                                        canMove = false;
                                    }
                                }
                            });
                            
                            if (canMove) {
                                nodeXPositions.set(nodeId, newX);
                                const pos = finalPositions.get(nodeId)!;
                                pos.x = newX;
                            }
                        }
                    }
                }
            });
        });

        // Passada 4: Ajuste final para garantir espaçamento mínimo
        sortedLevels.forEach((level) => {
            const levelNodes = nodesByLevel.get(level)!;
            const sorted = levelNodes
                .map((id) => ({ id, x: nodeXPositions.get(id) ?? 0 }))
                .sort((a, b) => a.x - b.x);

            sorted.forEach((node, index) => {
                if (index > 0) {
                    const prev = sorted[index - 1];
                    const minX = prev.x + MIN_SIBLING_SPACING;
                    if (node.x < minX) {
                        node.x = minX;
                        nodeXPositions.set(node.id, minX);
                        const pos = finalPositions.get(node.id)!;
                        pos.x = minX;
                    }
                }
            });
        });

        // Atualiza as posições dos nós
        const updatedNodes = nodes.map((node: any) => {
            const pos = finalPositions.get(node.id);
            if (pos) {
                return {
                    ...node,
                    position: {
                        x: pos.x - NODE_WIDTH / 2,
                        y: pos.y,
                    },
                };
            }
            return node;
        });

        setNodes(updatedNodes);
        saveToLocalStorage(updatedNodes, edges);

        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);

        console.log('Canvas organizado com sucesso!');
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
