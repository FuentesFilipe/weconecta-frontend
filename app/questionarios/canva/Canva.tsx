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

function CanvasContent() {
    const searchParams = useSearchParams();
    const surveyId = parseInt(searchParams.get('id') as string, 10);
    // Hooks customizados
    const canvasState = useCanvasState();
    const canvasOperations = useCanvasOperations();
    const { data: surveysElements } = useGetAllSurveysElements({
        description: canvasState.searchTerm,
    });
    const selectedNode = Array.isArray(canvasOperations.nodes) 
        ? canvasOperations.nodes.find(
        (node: any) => node.id === canvasState.selectedNodeId,
          )
        : null;
    const selectedNodeOptions = useMemo(() => {
        if (!selectedNode || !Array.isArray(canvasOperations.nodes) || !Array.isArray(canvasOperations.edges)) {
            return [];
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
    const { data: survey, isLoading: isSurveyLoading } = useGetSurveysById(surveyId);

    useEffect(() => {
        if (survey) {
            const savedFlow = canvasOperations.loadFromLocalStorage();
            
            // Parse nodes e edges do survey.flow se forem strings
            let surveyNodes: any[] = [];
            let surveyEdges: any[] = [];
            
            if (survey.flow) {
                try {
                    surveyNodes = typeof survey.flow.nodes === 'string' 
                        ? JSON.parse(survey.flow.nodes) 
                        : (Array.isArray(survey.flow.nodes) ? survey.flow.nodes : []);
                    
                    surveyEdges = typeof survey.flow.edges === 'string' 
                        ? JSON.parse(survey.flow.edges) 
                        : (Array.isArray(survey.flow.edges) ? survey.flow.edges : []);
                } catch (error) {
                    console.error('Erro ao fazer parse do flow:', error);
                    surveyNodes = [];
                    surveyEdges = [];
                }
            }
            
            // Prioriza dados salvos no localStorage, senão usa do survey
            const nodesToSet = savedFlow && savedFlow.nodes && Array.isArray(savedFlow.nodes) 
                ? savedFlow.nodes 
                : (Array.isArray(surveyNodes) ? surveyNodes : []);
            
            const edgesToSet = savedFlow && savedFlow.edges && Array.isArray(savedFlow.edges) 
                ? savedFlow.edges 
                : (Array.isArray(surveyEdges) ? surveyEdges : []);
            
            canvasOperations.setNodes(nodesToSet);
            canvasOperations.setEdges(edgesToSet);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [survey, isSurveyLoading]);

    const { mutate: saveFlow } = useSurveysSaveFlowMutation(surveyId, {
        surveyId,
        nodes: canvasOperations.nodes,
        edges: canvasOperations.edges,
    });

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

    // Função para confirmar deleção
    const handleConfirmDelete = useCallback(() => {
        if (!canvasState.deleteItem) {
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
                const nodeIdToDelete = canvasState.deleteItem.id;
                
                // Adiciona o nó que está sendo deletado
                nodesToRemove.add(nodeIdToDelete);

                // Encontra apenas os filhos DIRETOS (nós conectados diretamente como target)
                const directChildren = canvasOperations.edges
                    .filter((edge: any) => edge.source === nodeIdToDelete)
                    .map((edge: any) => edge.target);

                // Adiciona apenas os filhos diretos à lista de remoção
                directChildren.forEach((childId: string) => {
                    nodesToRemove.add(childId);
                });

                // Remove todas as conexões relacionadas aos nós que serão deletados
                const connectionsToRemove = canvasOperations.edges.filter(
                    (edge: any) =>
                        nodesToRemove.has(edge.source) ||
                        nodesToRemove.has(edge.target),
                );

                console.log(
                    '🧹 Nós que serão removidos (nó deletado + filhos diretos):',
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
        handleConfirmMultipleDelete,
    ]);

    // Garantir que os nós tenham as funções necessárias
    const nodesWithFunctions = ensureNodeFunctions(
        canvasOperations.nodes,
        canvasHandlers.handleNodeDelete,
        (el) => canvasState.handleEditSidebarElement(el),
    );

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
