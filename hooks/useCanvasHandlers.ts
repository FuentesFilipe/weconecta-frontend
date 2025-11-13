'use client';

import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import {
    createAlternativeEdges,
    createAlternativeNodes,
    createInputNode,
    createNewNode,
    handleInsertOnCanvaAtPosition,
} from '../utils/canvasUtils';

interface UseCanvasHandlersProps {
    nodes: any[];
    edges: any[];
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    saveToLocalStorage: (nodes: any[], edges: any[]) => void;
    selectedNodeId: string | null;
    isEditMode: boolean;
    editingElementModal: {
        isOpen: boolean;
        surveyElement: SurveyElementDto | null;
    };
    selectedNodes: string[];
    setSelectedNodes: (nodes: string[]) => void;
    setDeleteItem: (item: any) => void;
    setIsDeleteModalOpen: (open: boolean) => void;
    handleCloseModal: () => void;
    handleNodeDoubleClick: (nodeId: string) => void;
}

export function useCanvasHandlers({
    nodes,
    edges,
    setNodes,
    setEdges,
    saveToLocalStorage,
    selectedNodeId,
    isEditMode,
    editingElementModal,
    selectedNodes,
    setSelectedNodes,
    setDeleteItem,
    setIsDeleteModalOpen,
    handleCloseModal,
    handleNodeDoubleClick,
}: UseCanvasHandlersProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const surveyId = parseInt(searchParams.get('id') as string, 10);

    const handleGoBack = useCallback(() => {
        const segments = pathname.split('/').filter(Boolean);
        segments.pop();
        const newPath = '/' + segments.join('/');
        router.push(newPath || '/');
    }, [pathname, router]);

    const handleCanvasDoubleClick = useCallback(
        (event: any) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const newNodeId = `node-${Date.now()}`;
            const newNode = createNewNode(
                newNodeId,
                { x: x - 75, y: y - 40 },
                'Novo nó',
                'mensagem',
                2,
                handleNodeDelete,
                handleNodeDoubleClick,
            );

            setNodes((prevNodes: any) => [...prevNodes, newNode]);
            saveToLocalStorage([...nodes, newNode], edges);

            handleNodeDoubleClick(newNodeId);
        },
        [nodes, edges, setNodes, saveToLocalStorage, handleNodeDoubleClick],
    );

    const handleNodeDelete = useCallback(
        (nodeId: string) => {
            console.log('🗑️ handleNodeDelete chamado para:', nodeId);
            console.log(
                '📋 Nodes atuais:',
                nodes.map((n: any) => ({ id: n.id, label: n.data.label })),
            );

            const node = nodes.find((n: any) => n.id === nodeId);
            console.log(
                '🔍 Nó encontrado:',
                node
                    ? { id: node.id, label: node.data.label }
                    : 'NÃO ENCONTRADO',
            );

            if (node) {
                console.log('✅ Abrindo modal de confirmação...');
                setDeleteItem({
                    type: 'node',
                    id: nodeId,
                    label: node.data.label,
                });
                setIsDeleteModalOpen(true);
            } else {
                console.error('❌ Nó não encontrado! ID:', nodeId);
            }
        },
        [nodes, setDeleteItem, setIsDeleteModalOpen],
    );

    const handleEdgeDoubleClick = useCallback(
        (edgeId: string) => {
            const edge = edges.find((e: any) => e.id === edgeId);
            if (edge) {
                setDeleteItem({
                    type: 'edge',
                    id: edgeId,
                    label: 'Conexão entre nós',
                });
                setIsDeleteModalOpen(true);
            }
        },
        [edges, setDeleteItem, setIsDeleteModalOpen],
    );

    const handleModalConfirm = useCallback(
        (modalData: {
            titulo: string;
            tipo: string;
            alternativas: string[];
        }) => {
            // Se estamos editando um elemento do canvas (via botão de editar)
            if (
                editingElementModal.isOpen &&
                editingElementModal.surveyElement
            ) {
                const elementId = editingElementModal.surveyElement.id;
                console.log(
                    '✏️ Atualizando nó do canvas para elemento:',
                    elementId,
                    modalData,
                );

                // Encontra todos os nós que correspondem a este elemento
                const nodesToUpdate = nodes.filter(
                    (node: any) =>
                        node.data?.surveyElementId === elementId ||
                        node.data?.surveyElement?.id === elementId ||
                        (node.id && node.id.includes(`element-${elementId}`))
                );

                if (nodesToUpdate.length === 0) {
                    console.warn('⚠️ Nenhum nó encontrado para atualizar');
                    handleCloseModal();
                    return;
                }

                // Pega o nó principal (o primeiro que não é opção)
                const mainNode = nodesToUpdate.find(
                    (node: any) => !node.id.includes('option-') && !node.id.includes('-alt-')
                ) || nodesToUpdate[0];

                if (!mainNode) {
                    console.warn('⚠️ Nó principal não encontrado');
                    handleCloseModal();
                    return;
                }

                console.log('📝 Nó principal encontrado:', mainNode.id);

                // Remove nós filhos antigos (opções) deste elemento
                const childNodeIds = new Set<string>();
                edges.forEach((edge: any) => {
                    if (edge.source === mainNode.id) {
                        childNodeIds.add(edge.target);
                    }
                });

                // Remove edges dos filhos antigos
                let updatedEdges = edges.filter(
                    (edge: any) =>
                        edge.source !== mainNode.id && !childNodeIds.has(edge.target)
                );

                // Remove nós filhos antigos
                let updatedNodes = nodes.filter(
                    (node: any) => node.id !== mainNode.id && !childNodeIds.has(node.id)
                );

                // Atualiza o nó principal
                const nodeType: 'mensagem' | 'alternativa' | 'input' | 'fim' = 'mensagem';
                const updatedMainNode = {
                    ...mainNode,
                    data: {
                        ...mainNode.data,
                        label: modalData.titulo,
                        type: nodeType,
                        maxEdges:
                            modalData.tipo === 'MultiplaEscolha' ||
                            modalData.tipo === 'Alternativa'
                                ? modalData.alternativas.length
                                : modalData.tipo === 'Input'
                                  ? 1
                                  : mainNode.data.maxEdges,
                        surveyElement: {
                            ...editingElementModal.surveyElement,
                            description: modalData.titulo,
                        },
                    },
                };

                updatedNodes = [...updatedNodes, updatedMainNode];

                // Se tem alternativas, cria novos nós filhos
                if (
                    (modalData.tipo === 'MultiplaEscolha' ||
                        modalData.tipo === 'Alternativa') &&
                    modalData.alternativas.length > 0
                ) {
                    const newAlternativeNodes = createAlternativeNodes(
                        mainNode.id,
                        mainNode.position,
                        modalData.alternativas,
                        handleNodeDelete,
                        handleNodeDoubleClick,
                    );

                    const newAlternativeEdges = createAlternativeEdges(
                        mainNode.id,
                        newAlternativeNodes,
                    );

                    updatedNodes = [...updatedNodes, ...newAlternativeNodes];
                    updatedEdges = [...updatedEdges, ...newAlternativeEdges];
                } else if (modalData.tipo === 'Input') {
                    const { node: inputNode, edge: inputEdge } = createInputNode(
                        mainNode.id,
                        mainNode.position,
                        handleNodeDelete,
                        handleNodeDoubleClick,
                    );

                    updatedNodes = [...updatedNodes, inputNode];
                    updatedEdges = [...updatedEdges, inputEdge];
                }

                setNodes(updatedNodes);
                setEdges(updatedEdges);
                saveToLocalStorage(updatedNodes, updatedEdges);

                console.log('✅ Nó atualizado no canvas:', {
                    nodeId: mainNode.id,
                    newLabel: modalData.titulo,
                    newType: modalData.tipo,
                    alternatives: modalData.alternativas,
                });

                handleCloseModal();
                return;
            }

            if (selectedNodeId && isEditMode) {
                const selectedNode = nodes.find(
                    (node: any) => node.id === selectedNodeId,
                );
                if (!selectedNode) return;

                const nodeType: 'mensagem' | 'alternativa' | 'input' | 'fim' =
                    'mensagem';

                const updatedNodes = nodes.map((node: any) => {
                    if (node.id === selectedNodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: modalData.titulo,
                                type: nodeType,
                                maxEdges:
                                    modalData.tipo === 'MultiplaEscolha' ||
                                    modalData.tipo === 'Alternativa'
                                        ? modalData.alternativas.length
                                        : modalData.tipo === 'Input'
                                          ? 1
                                          : node.data.maxEdges,
                            },
                        };
                    }
                    return node;
                });

                if (
                    modalData.tipo === 'MultiplaEscolha' ||
                    modalData.tipo === 'Alternativa'
                ) {
                    const newNodes = createAlternativeNodes(
                        selectedNodeId,
                        selectedNode.position,
                        modalData.alternativas,
                        handleNodeDelete,
                        handleNodeDoubleClick,
                    );

                    const newEdges = createAlternativeEdges(
                        selectedNodeId,
                        newNodes,
                    );

                    const newNodesAndEdges = [...updatedNodes, ...newNodes];
                    const newEdgesList = [...edges, ...newEdges];

                    setNodes(newNodesAndEdges);
                    setEdges(newEdgesList);
                    saveToLocalStorage(newNodesAndEdges, newEdgesList);
                } else if (modalData.tipo === 'Input') {
                    const { node: inputNode, edge: inputEdge } =
                        createInputNode(
                            selectedNodeId,
                            selectedNode.position,
                            handleNodeDelete,
                            handleNodeDoubleClick,
                        );

                    const newNodesAndEdges = [...updatedNodes, inputNode];
                    const newEdgesList = [...edges, inputEdge];

                    setNodes(newNodesAndEdges);
                    setEdges(newEdgesList);
                    saveToLocalStorage(newNodesAndEdges, newEdgesList);
                } else {
                    setNodes(updatedNodes);
                    saveToLocalStorage(updatedNodes, edges);
                }
            } else {
                const newNodeId = `node-${Date.now()}`;
                const nodeType: 'mensagem' | 'alternativa' | 'input' | 'fim' =
                    'mensagem';

                const newNode = createNewNode(
                    newNodeId,
                    {
                        x: Math.random() * 400 + 100,
                        y: Math.random() * 300 + 100,
                    },
                    modalData.titulo,
                    nodeType,
                    modalData.tipo === 'MultiplaEscolha' ||
                        modalData.tipo === 'Alternativa'
                        ? modalData.alternativas.length
                        : modalData.tipo === 'Input'
                          ? 1
                          : 2,
                    handleNodeDelete,
                    handleNodeDoubleClick,
                );

                if (
                    modalData.tipo === 'MultiplaEscolha' ||
                    modalData.tipo === 'Alternativa'
                ) {
                    const alternativeNodes = createAlternativeNodes(
                        newNodeId,
                        newNode.position,
                        modalData.alternativas,
                        handleNodeDelete,
                        handleNodeDoubleClick,
                    );

                    const alternativeEdges = createAlternativeEdges(
                        newNodeId,
                        alternativeNodes,
                    );

                    const allNewNodes = [newNode, ...alternativeNodes];
                    const allNewEdges = alternativeEdges;

                    setNodes((prev: any) => [...prev, ...allNewNodes]);
                    setEdges((prev: any) => [...prev, ...allNewEdges]);
                    saveToLocalStorage(
                        [...nodes, ...allNewNodes],
                        [...edges, ...allNewEdges],
                    );
                } else {
                    setNodes((prev: any) => [...prev, newNode]);
                    saveToLocalStorage([...nodes, newNode], edges);
                }

                console.log('✅ Novo elemento criado e inserido no canvas:', {
                    id: newNodeId,
                    titulo: modalData.titulo,
                    tipo: modalData.tipo,
                    alternativas: modalData.alternativas,
                });
            }

            handleCloseModal();
        },
        [
            editingElementModal,
            selectedNodeId,
            isEditMode,
            nodes,
            edges,
            setNodes,
            setEdges,
            saveToLocalStorage,
            handleNodeDelete,
            handleNodeDoubleClick,
            handleCloseModal,
        ],
    );

    const handleConfirmDelete = useCallback(() => {
        // Esta função será implementada no componente principal
        console.log('handleConfirmDelete chamado');
    }, []);

    const handleDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            try {
                const elementData = JSON.parse(
                    event.dataTransfer.getData('application/json'),
                );

                const reactFlowBounds =
                    event.currentTarget.getBoundingClientRect();
                const position = {
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                };

                console.log(
                    'Drop realizado em:',
                    position,
                    'com elemento:',
                    elementData,
                );

                handleInsertOnCanvaAtPosition(
                    elementData,
                    position,
                    setNodes,
                    setEdges,
                    nodes,
                    edges,
                    saveToLocalStorage,
                    handleNodeDelete,
                    handleNodeDoubleClick,
                );
            } catch (error) {
                console.error('Erro ao processar drop:', error);
            }
        },
        [
            nodes,
            edges,
            setNodes,
            setEdges,
            saveToLocalStorage,
            handleNodeDelete,
            handleNodeDoubleClick,
        ],
    );

    const handleDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (
                (event.key === 'Delete' || event.key === 'Backspace') &&
                selectedNodes.length > 0
            ) {
                handleDeleteMultipleNodes();
            }
        },
        [selectedNodes],
    );

    const handleDeleteMultipleNodes = useCallback(() => {
        if (selectedNodes.length === 0) return;

        const nodesToDelete = nodes.filter((node: any) =>
            selectedNodes.includes(node.id),
        );
        const nodeLabels = nodesToDelete
            .map((node: any) => node.data.label)
            .join(', ');

        setDeleteItem({
            type: 'node',
            id: 'multiple',
            label: `Múltiplos nós: ${nodeLabels}`,
        });
        setIsDeleteModalOpen(true);
    }, [selectedNodes, nodes, setDeleteItem, setIsDeleteModalOpen]);

    const handleSelectionChange = useCallback(
        ({ nodes: selectedNodesList }: { nodes: any[] }) => {
            const selectedIds = selectedNodesList.map((node) => node.id);
            setSelectedNodes(selectedIds);
            console.log('Nós selecionados:', selectedIds);
        },
        [setSelectedNodes],
    );

    const handleInsertOnCanva = useCallback(
        (element: SurveyElementDto) => {
            console.log('Inserindo elemento no canvas:', element);
            console.log('Element ID:', element.id);
            console.log('Element description:', element.description);

            const newNodeId = `element-${element.id}-${Date.now()}`;
            const basePosition = { x: 250, y: 250 };

            // Cria o nó com o surveyElement incluído
            const newNode = {
                id: newNodeId,
                type: 'customNode',
                position: basePosition,
                data: {
                    label: element.description,
                    type: 'mensagem',
                    maxEdges: element.options?.length > 0 ? element.options.length : 2,
                    surveyElement: element,
                    surveyElementId: element.id,
                    onClick: () => console.log('Clique no novo nó'),
                    onDoubleClick: () => handleNodeDoubleClick(newNodeId),
                    onEdit: () => handleNodeDoubleClick(newNodeId),
                    onDelete: () => handleNodeDelete(newNodeId),
                },
            };

            const newNodes = [newNode];
            const newEdges: any[] = [];

            if (element.options && element.options.length > 0) {
                element.options.forEach((option: any, index: number) => {
                    const childNodeId = `option-${element.id}-${option.id}-${Date.now()}`;
                    const childNode = {
                        id: childNodeId,
                        type: 'customNode',
                        position: {
                            x: basePosition.x + index * 200,
                            y: basePosition.y + 150,
                        },
                        data: {
                            label: option.description,
                            type: 'alternativa',
                            maxEdges: 1,
                            surveyElement: undefined, // Opções não têm surveyElement próprio
                            surveyElementId: undefined, // Opções não têm surveyElementId
                            onClick: () => console.log('Clique na alternativa'),
                            onDoubleClick: () => handleNodeDoubleClick(childNodeId),
                            onEdit: () => handleNodeDoubleClick(childNodeId),
                            onDelete: () => handleNodeDelete(childNodeId),
                        },
                    };

                    const edge = {
                        id: `${newNodeId}-to-${childNodeId}`,
                        source: newNodeId,
                        target: childNodeId,
                    };

                    newNodes.push(childNode as any);
                    newEdges.push(edge);
                });
            }

            setNodes((prevNodes: any) => [...prevNodes, ...newNodes]);
            setEdges((prevEdges: any) => [...prevEdges, ...newEdges]);

            saveToLocalStorage(
                [...nodes, ...newNodes],
                [...edges, ...newEdges],
            );

            console.log(
                '✅ Elemento inserido no canvas com filhos conectados:',
                {
                    mainNode: newNode,
                    childNodes: newNodes.slice(1),
                    edges: newEdges,
                },
            );
        },
        [
            nodes,
            edges,
            setNodes,
            setEdges,
            saveToLocalStorage,
            handleNodeDelete,
            handleNodeDoubleClick,
        ],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        handleGoBack,
        handleCanvasDoubleClick,
        handleNodeDelete,
        handleEdgeDoubleClick,
        handleModalConfirm,
        handleConfirmDelete,
        handleDrop,
        handleDragOver,
        handleDeleteMultipleNodes,
        handleSelectionChange,
        handleInsertOnCanva,
    };
}
