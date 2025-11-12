'use client';

import { ConfirmDeleteModal } from '@/components/Modal/ConfirmDeleteModal';
import { SurveysElementModal } from '@/components/Modal/SurveysElementModal';
import { useSurveysSaveFlowMutation } from '@/services/core/surveys/mutations';
import {
    Background,
    BackgroundVariant,
    ReactFlow,
    ReactFlowProvider,
    SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
<<<<<<< HEAD
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import CanvasSidebar from '../../../components/CanvasComponents/CanvasSidebar';
import CanvasToolbar from '../../../components/CanvasComponents/CanvasToolbar';
import CustomNode from '../../../components/CanvasComponents/CustomNode';
import { useCanvasHandlers } from '../../../hooks/useCanvasHandlers';
import { useCanvasOperations } from '../../../hooks/useCanvasOperations';
import { useCanvasState } from '../../../hooks/useCanvasState';
import { useGetSurveysById } from '../../../services/core/surveys/queries';
import { useGetAllSurveysElements } from '../../../services/core/surveysElements/queries';
import { queryClient } from '../../../services/query-client';
import { ensureNodeFunctions } from '../../../utils/canvasUtils';
import QUERY_KEYS from '../../../utils/contants/queries';
import './index.css';
=======
import { Save, Undo2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import SpeedDialTooltipOpen from '../../../components/SpeedDial/speeddialtest';
import type { CanvasEdge, CanvasNode } from './CanvaAdapter';
import { toCanvasModel } from './CanvaAdapter';
import CustomNode from './CustomNode';
import { getSurveyGraph } from './Service';

>>>>>>> e448d88 (carregar questionario a partir de um json)

const nodeTypes = {
    customNode: CustomNode,
};

export default function Canva() {
    return (
        <ReactFlowProvider>
            <CanvasContent />
        </ReactFlowProvider>
    );
}

<<<<<<< HEAD
function CanvasContent() {
    const searchParams = useSearchParams();
    const surveyId = parseInt(searchParams.get('id') as string, 10);
    // Hooks customizados
    const canvasState = useCanvasState();
    const canvasOperations = useCanvasOperations();
    const { data: surveysElements } = useGetAllSurveysElements({
        description: canvasState.searchTerm,
    });
    const selectedNode = canvasOperations.nodes.find(
        (node: any) => node.id === canvasState.selectedNodeId,
    );
    const selectedNodeOptions = useMemo(() => {
        if (!selectedNode) {
            return [];
=======
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{
        type: 'node' | 'edge';
        id: string;
        label?: string;
    } | null>(null);



    const handleGoBack = () => {
        const segments = pathname.split('/').filter(Boolean); // split into parts
        segments.pop(); // remove the last part
        const newPath = '/' + segments.join('/');
        router.push(newPath || '/');
    };


    const saveToLocalStorage = (nodesData: any[], edgesData: any[]) => {
        try {
            localStorage.setItem('weconnecta-canva-nodes', JSON.stringify(nodesData));
            localStorage.setItem('weconnecta-canva-edges', JSON.stringify(edgesData));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
>>>>>>> e448d88 (carregar questionario a partir de um json)
        }

        const childEdges = canvasOperations.edges.filter(
            (edge: any) => edge.source === selectedNode.id,
        );

        return childEdges
            .map((edge: any) =>
                canvasOperations.nodes.find(
                    (node: any) => node.id === edge.target,
                ),
            )
            .filter(
                (node: any) => !!node && typeof node.data?.label === 'string',
            )
            .map((node: any) => node.data.label.trim())
            .filter((label: string) => label.length > 0);
    }, [selectedNode, canvasOperations.edges, canvasOperations.nodes]);
    const isNodeModalOpen = canvasState.isModalOpen;
    const isSidebarModalOpen = canvasState.editingElementModal.isOpen;

<<<<<<< HEAD
<<<<<<< HEAD
    const { data } = useGetAllSurveysElements({
        description: canvasState.searchTerm,
    });

    surveysElements = data?.filter((element) => !element.deletedAt);

    const handleDeleteSurveyElement = useCallback(
        (deletedElementId: number) => {
            console.log(
                `🗑️ Removendo nós do canvas para o elemento: ${deletedElementId}`,
            );

            const flowNodeIdsToDelete = canvasOperations.nodes
                .filter((node: any) => node.data?.id === deletedElementId)
                .map((node: any) => node.id);

            if (flowNodeIdsToDelete.length === 0) {
                console.log('ℹ️ Nenhum nó no canvas para remover.');
                return;
            }

            const updatedNodes = canvasOperations.nodes.filter(
                (node: any) => !flowNodeIdsToDelete.includes(node.id),
            );

            const updatedEdges = canvasOperations.edges.filter(
                (edge: any) =>
                    !flowNodeIdsToDelete.includes(edge.source) &&
                    !flowNodeIdsToDelete.includes(edge.target),
            );

            canvasOperations.setNodes(updatedNodes);
            canvasOperations.setEdges(updatedEdges);
            canvasOperations.saveToLocalStorage(updatedNodes, updatedEdges);

            console.log(
                `✅ ${flowNodeIdsToDelete.length} nó(s) removido(s) do canvas.`,
            );
        },
        [
            canvasOperations.nodes,
            canvasOperations.edges,
            canvasOperations.setNodes,
            canvasOperations.setEdges,
            canvasOperations.saveToLocalStorage,
        ],
    );
    const { mutate: saveFlow, isPending } = useSurveysSaveFlowMutation(
        parseInt(searchParams.get('id') as string, 10),
        {
            nodes: canvasOperations.nodes,
            edges: canvasOperations.edges,
        } as unknown as string,
    );
=======
    const { data: survey, isLoading: isSurveyFetching } = useGetSurveysById(surveyId);
=======
    const { data: survey, isLoading: isSurveyLoading } = useGetSurveysById(surveyId);
>>>>>>> 791444e (Formataçao + Adiciona botao para limpar armazenamento local)

<<<<<<< HEAD
=======

        const newNodeId = `node-${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: 'customNode',
            position: { x: x - 75, y: y - 40 },
            data: {
                label: 'Novo nó',
                type: 'mensagem' as const,
                maxEdges: 2,
                onClick: () => console.log('Clique no novo nó'),
                onDoubleClick: () => handleNodeDoubleClick(newNodeId),
                onDelete: () => handleNodeDelete(newNodeId)
            }
        };

        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        saveToLocalStorage(newNodes, edges);


        setSelectedNodeId(newNodeId);
        setIsEditMode(false);
        setIsModalOpen(true);
    };


    const getSelectedNodeData = () => {
        if (!selectedNodeId) return null;
        const node = nodes.find((n: any) => n.id === selectedNodeId);
        return node ? {
            label: node.data.label,
            type: node.data.type,
            maxEdges: node.data.maxEdges
        } : null;
    };



    const handleEdgeDoubleClick = (edgeId: string) => {
        const edge = edges.find((e: any) => e.id === edgeId);
        if (edge) {
            setDeleteItem({
                type: 'edge',
                id: edgeId,
                label: 'Conexão entre nós'
            });
            setIsDeleteModalOpen(true);
        }
    };


    const savedData = loadFromLocalStorage();
    //const [nodes, setNodes] = useState(savedData?.nodes || []);
    //const [edges, setEdges] = useState(savedData?.edges || []);
    const [nodes, setNodes] = useState<CanvasNode[]>(savedData?.nodes as CanvasNode[] || []);
    const [edges, setEdges] = useState<CanvasEdge[]>(savedData?.edges as CanvasEdge[] || []);

    // Atualizar funções onDelete dos nodes carregados do localStorage
>>>>>>> e448d88 (carregar questionario a partir de um json)
    useEffect(() => {
        if (survey) {
            const savedFlow = canvasOperations.loadFromLocalStorage();
            canvasOperations.setEdges(savedFlow && savedFlow.edges ? savedFlow.edges : survey.flow && survey.flow.edges ? survey.flow.edges : []);
            canvasOperations.setNodes(savedFlow && savedFlow.nodes ? savedFlow.nodes : survey.flow && survey.flow.nodes ? survey.flow.nodes : []);
        }
    }, [survey, isSurveyLoading]);


    const { mutate: saveFlow, isPending } = useSurveysSaveFlowMutation(surveyId, { nodes: canvasOperations.nodes, edges: canvasOperations.edges } as unknown as string);
>>>>>>> b63099d (Carrega survey do armazenamento ou utiliza do localstorage)

    const canvasHandlers = useCanvasHandlers({
        nodes: canvasOperations.nodes,
        edges: canvasOperations.edges,
        setNodes: canvasOperations.setNodes,
        setEdges: canvasOperations.setEdges,
        saveToLocalStorage: canvasOperations.saveToLocalStorage,
        selectedNodeId: canvasState.selectedNodeId,
        isEditMode: canvasState.isEditMode,
        editingElementModal: canvasState.editingElementModal,
        selectedNodes: canvasState.selectedNodes,
        setSelectedNodes: canvasState.setSelectedNodes,
        setDeleteItem: canvasState.setDeleteItem,
        setIsDeleteModalOpen: canvasState.setIsDeleteModalOpen,
        handleCloseModal: canvasState.handleCloseModal,
        handleNodeDoubleClick: canvasState.handleNodeDoubleClick,
    });

    const handleFlowSave = useCallback(() => {
        saveFlow();
    }, [saveFlow]);

<<<<<<< HEAD
    // Função para confirmar deleção
    const handleConfirmDelete = useCallback(() => {
        if (!canvasState.deleteItem) {
=======

    useEffect (() => {
        async function bootFromPayloadIfEmpty() {
            if (nodes.length || edges.length) return;

            const payload = await getSurveyGraph(1);
            const graph = toCanvasModel(payload);

            const nodesWithHandlers = graph.nodes.map((n: any) => ({
                ...n,
                data: {
                    ...n.data,
                    onDoubleClick: () => handleNodeDoubleClick(n.id),
                    onDelete: () => handleNodeDelete(n.id)
                }
            }));

            setNodes(nodesWithHandlers);
            setEdges(graph.edges);
            saveToLocalStorage(nodesWithHandlers, graph.edges);
        }
        void bootFromPayloadIfEmpty();
    }, []);


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNodeId(null);
        setIsEditMode(false);
    };


    const handleModalConfirm = (modalData: {
        titulo: string;
        tipo: string;
        alternativas: string[];
    }) => {
        if (!selectedNodeId) return;

        const selectedNode = nodes.find((node: any) => node.id === selectedNodeId);
        if (!selectedNode) return;


        const nodeType: 'mensagem' | 'alternativa' | 'input' | 'fim' = 'mensagem';


        const updatedNodes = nodes.map((node: any) => {
            if (node.id === selectedNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: modalData.titulo,
                        type: nodeType,
                        maxEdges: modalData.tipo === 'MultiplaEscolha' || modalData.tipo === 'Alternativa'
                            ? modalData.alternativas.length
                            : (modalData.tipo === 'Input' ? 1 : node.data.maxEdges)
                    }
                };
            }
            return node;
        });


        if (modalData.tipo === 'MultiplaEscolha' || modalData.tipo === 'Alternativa') {
            const newNodes = modalData.alternativas
                .filter(alt => alt.trim() !== '')
                .map((alternativa, index) => ({
                    id: `${selectedNodeId}-alt-${index}`,
                    type: 'customNode',
                    position: {
                        x: selectedNode.position.x + (index * 200),
                        y: selectedNode.position.y + 150
                    },
                    data: {
                        label: alternativa,
                        type: 'alternativa' as const,
                        maxEdges: 1,
                        onClick: () => console.log('Clique na alternativa:', alternativa),
                        onDoubleClick: () => handleNodeDoubleClick(`${selectedNodeId}-alt-${index}`),
                        onDelete: () => handleNodeDelete(`${selectedNodeId}-alt-${index}`)
                    }
                }));


            const newEdges = newNodes.map((node: any, index: number) => ({
                id: `${selectedNodeId}-to-${node.id}`,
                source: selectedNodeId,
                target: node.id
            }));

            const newNodesAndEdges = [...updatedNodes, ...newNodes];
            const newEdgesList = [...edges, ...newEdges];

            setNodes(newNodesAndEdges);
            setEdges(newEdgesList);


            saveToLocalStorage(newNodesAndEdges, newEdgesList);
        } else if (modalData.tipo === 'Input') {

            const inputNode = {
                id: `${selectedNodeId}-input`,
                type: 'customNode',
                position: {
                    x: selectedNode.position.x,
                    y: selectedNode.position.y + 150
                },
                data: {
                    label: 'Campo de entrada',
                    type: 'input' as const,
                    maxEdges: 1,
                    onClick: () => console.log('Clique no input'),
                    onDoubleClick: () => handleNodeDoubleClick(`${selectedNodeId}-input`),
                    onDelete: () => handleNodeDelete(`${selectedNodeId}-input`)
                }
            };

            const inputEdge = {
                id: `${selectedNodeId}-to-input`,
                source: selectedNodeId,
                target: `${selectedNodeId}-input`
            };

            const newNodesAndEdges = [...updatedNodes, inputNode];
            const newEdgesList = [...edges, inputEdge];

            setNodes(newNodesAndEdges);
            setEdges(newEdgesList);


            saveToLocalStorage(newNodesAndEdges, newEdgesList);
        } else {
            setNodes(updatedNodes);

            saveToLocalStorage(updatedNodes, edges);
        }

        handleCloseModal();
    };


    const handleConfirmDelete = () => {
        if (!deleteItem) {
>>>>>>> e448d88 (carregar questionario a partir de um json)
            console.error('❌ Nenhum item para deletar!');
            return;
        }

        console.log('🗑️ Confirmando deleção de:', canvasState.deleteItem);

        if (canvasState.deleteItem.type === 'node') {
            if (canvasState.deleteItem.id === 'multiple') {
                handleConfirmMultipleDelete();
                return;
            } else {
                console.log('🗑️ Deletando nó:', canvasState.deleteItem.id);

                const nodesToRemove = new Set<string>();
                const collectDescendants = (nodeId: string) => {
                    canvasOperations.edges.forEach((edge: any) => {
                        if (
                            edge.source === nodeId &&
                            !nodesToRemove.has(edge.target)
                        ) {
                            nodesToRemove.add(edge.target);
                            collectDescendants(edge.target);
                        }
                    });
                };

                nodesToRemove.add(canvasState.deleteItem.id);
                collectDescendants(canvasState.deleteItem.id);

                const connectionsToRemove = canvasOperations.edges.filter(
                    (edge: any) =>
                        nodesToRemove.has(edge.source) ||
                        nodesToRemove.has(edge.target),
                );

                console.log(
                    '🧹 Nós que serão removidos (incluindo descendentes):',
                    Array.from(nodesToRemove),
                );
                console.log(
                    '🔗 Conexões que serão removidas:',
                    connectionsToRemove,
                );

                const newNodes = canvasOperations.nodes.filter(
                    (node: any) => !nodesToRemove.has(node.id),
                );
                const newEdges = canvasOperations.edges.filter(
                    (edge: any) =>
                        !nodesToRemove.has(edge.source) &&
                        !nodesToRemove.has(edge.target),
                );

                console.log(
                    '📊 Antes da deleção - Nodes:',
                    canvasOperations.nodes.length,
                    'Edges:',
                    canvasOperations.edges.length,
                );
                console.log(
                    '📊 Depois da deleção - Nodes:',
                    newNodes.length,
                    'Edges:',
                    newEdges.length,
                );
                console.log(
                    '🔗 Conexões removidas:',
                    connectionsToRemove.length,
                );

                canvasOperations.setNodes(newNodes);
                canvasOperations.setEdges(newEdges);
                canvasOperations.saveToLocalStorage(newNodes, newEdges);

                console.log(
                    '✅ Nó e todas as suas conexões foram deletados com sucesso!',
                );
            }
        } else if (canvasState.deleteItem.type === 'edge') {
            console.log('🗑️ Deletando conexão:', canvasState.deleteItem.id);

            const newEdges = canvasOperations.edges.filter(
                (edge: any) => edge.id !== canvasState.deleteItem!.id,
            );
            canvasOperations.setEdges(newEdges);
            canvasOperations.saveToLocalStorage(
                canvasOperations.nodes,
                newEdges,
            );

            console.log('✅ Conexão deletada com sucesso!');
        }

        canvasState.setDeleteItem(null);
        canvasState.setIsDeleteModalOpen(false);
    }, [
        canvasState.deleteItem,
        canvasOperations.nodes,
        canvasOperations.edges,
        canvasOperations.setNodes,
        canvasOperations.setEdges,
        canvasOperations.saveToLocalStorage,
        canvasState.setDeleteItem,
        canvasState.setIsDeleteModalOpen,
    ]);

    const handleConfirmMultipleDelete = useCallback(() => {
        const updatedNodes = canvasOperations.nodes.filter(
            (node: any) => !canvasState.selectedNodes.includes(node.id),
        );

        const updatedEdges = canvasOperations.edges.filter(
            (edge: any) =>
                !canvasState.selectedNodes.includes(edge.source) &&
                !canvasState.selectedNodes.includes(edge.target),
        );

        canvasOperations.setNodes(updatedNodes);
        canvasOperations.setEdges(updatedEdges);
        canvasOperations.saveToLocalStorage(updatedNodes, updatedEdges);

        canvasState.setSelectedNodes([]);
        canvasState.setIsDeleteModalOpen(false);
        canvasState.setDeleteItem(null);

        console.log(
            `✅ ${canvasState.selectedNodes.length} nós deletados com sucesso!`,
        );
    }, [
        canvasState.selectedNodes,
        canvasOperations.nodes,
        canvasOperations.edges,
        canvasOperations.setNodes,
        canvasOperations.setEdges,
        canvasOperations.saveToLocalStorage,
        canvasState.setSelectedNodes,
        canvasState.setIsDeleteModalOpen,
        canvasState.setDeleteItem,
    ]);

    // Garantir que os nós tenham as funções necessárias
    const nodesWithFunctions = ensureNodeFunctions(
        canvasOperations.nodes,
        canvasHandlers.handleNodeDelete,
        (el) => canvasState.handleEditSidebarElement(el),
    );

<<<<<<< HEAD
=======
    const clearLocalStorage = () => {
        try {
            const loadedNodes = JSON.parse(
                localStorage.getItem('weconnecta-canva-nodes') || '{}',
            );
            const loadedEdges = JSON.parse(
                localStorage.getItem('weconnecta-canva-edges') || '{}',
            );

            delete loadedNodes[surveyId!];
            delete loadedEdges[surveyId!];

            localStorage.setItem(
                'weconnecta-canva-nodes',
                JSON.stringify({
                    ...loadedNodes,
                }),
            );
            localStorage.setItem(
                'weconnecta-canva-edges',
                JSON.stringify({
                    ...loadedEdges,
                }),
            );

            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SURVEYS, surveyId] });
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }


>>>>>>> 791444e (Formataçao + Adiciona botao para limpar armazenamento local)
    return (
        <div className='canvas-layout-container'>
            <CanvasSidebar
                sidebarOpen={canvasState.sidebarOpen}
                setSidebarOpen={canvasState.setSidebarOpen}
                searchTerm={canvasState.searchTerm}
                onInputChange={canvasState.onInputChange}
                surveysElements={surveysElements}
                selectedNodes={canvasState.selectedNodes}
                onEditSidebarElement={canvasState.handleEditSidebarElement}
                onInsertOnCanva={canvasHandlers.handleInsertOnCanva}
                onClearSelection={canvasState.handleClearSelection}
                onDeleteMultipleNodes={canvasHandlers.handleDeleteMultipleNodes}
                onNewMessage={canvasState.handleNewMessage}
                onDeleteSurveyElement={handleDeleteSurveyElement}
            />

            <div className='canvas-main-content'>
                <div style={{ height: '97vh' }}>
                    <CanvasToolbar
                        onSave={() => handleFlowSave()}
                        onGoBack={canvasHandlers.handleGoBack}
                        onOrganizeCanvas={canvasOperations.organizeCanvas}
                        clearLocalStorage={clearLocalStorage}
                    />

                    <ReactFlow
                        nodes={nodesWithFunctions}
                        edges={canvasOperations.edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={canvasOperations.onNodesChange}
                        onEdgesChange={canvasOperations.onEdgesChange}
                        onConnect={canvasOperations.onConnect}
                        onEdgeDoubleClick={(event: any, edge: any) => {
                            event.preventDefault();
                            event.stopPropagation();
                            canvasHandlers.handleEdgeDoubleClick(edge.id);
                        }}
                        onDrop={canvasHandlers.handleDrop}
                        onDragOver={canvasHandlers.handleDragOver}
                        onSelectionChange={canvasHandlers.handleSelectionChange}
                        selectionMode={SelectionMode.Partial}
                        multiSelectionKeyCode={['Shift']}
                        deleteKeyCode={['Delete', 'Backspace']}
                        fitView
                    >
                        <Background
                            color='#FF894E'
                            variant={BackgroundVariant.Dots}
                        />
                    </ReactFlow>

                    {isNodeModalOpen && (
                        <SurveysElementModal
                            open={isNodeModalOpen}
                            onClose={canvasState.handleCloseModal}
                            onConfirm={canvasHandlers.handleModalConfirm}
                            initialData={
                                selectedNode
                                    ? {
                                          label: selectedNode.data?.label,
                                          type: selectedNode.data?.type,
                                          maxEdges: selectedNode.data?.maxEdges,
                                          options: selectedNodeOptions,
                                      }
                                    : undefined
                            }
                        />
                    )}

                    {canvasState.editingElementModal.isOpen && (
                        <SurveysElementModal
                            open={canvasState.editingElementModal.isOpen}
                            onClose={canvasState.handleCloseModal}
                            onConfirm={canvasHandlers.handleModalConfirm}
                            id={
                                canvasState.editingElementModal?.surveyElement
                                    ? canvasState.editingElementModal
                                          ?.surveyElement?.id
                                    : undefined
                            }
                        />
                    )}

                    <ConfirmDeleteModal
                        open={canvasState.isDeleteModalOpen}
                        onClose={canvasState.handleCloseDeleteModal}
                        onConfirm={handleConfirmDelete}
                        title={
                            canvasState.deleteItem?.type === 'node'
                                ? canvasState.deleteItem?.id === 'multiple'
                                    ? 'Deletar Nós Selecionados'
                                    : 'Deletar Nó'
                                : 'Deletar Conexão'
                        }
                        message={
                            canvasState.deleteItem?.type === 'node'
                                ? canvasState.deleteItem?.id === 'multiple'
                                    ? `Tem certeza que deseja deletar ${canvasState.selectedNodes.length} nós selecionados?\n\n${canvasState.deleteItem?.label}`
                                    : `Tem certeza que deseja deletar o nó "${canvasState.deleteItem?.label}"?`
                                : 'Tem certeza que deseja deletar esta conexão?'
                        }
                        itemType={
                            canvasState.deleteItem?.type === 'node'
                                ? 'nó'
                                : 'conexão'
                        }
                    />
                </div>
            </div>
        </div>
    );
}
