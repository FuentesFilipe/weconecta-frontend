'use client';

import { ConfirmDeleteModal } from '@/components/Modal/ConfirmDeleteModal';
import { SurveysElementModal } from '@/components/Modal/SurveysElementModal';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlignJustify, Save, Undo2, } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import CustomNode from './CustomNode';


const nodeTypes = {
    customNode: CustomNode,
};

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{
        type: 'node' | 'edge';
        id: string;
        label?: string;
    } | null>(null);


    const saveToLocalStorage = (nodesData: any[], edgesData: any[]) => {
        try {
            localStorage.setItem('weconnecta-canva-nodes', JSON.stringify(nodesData));
            localStorage.setItem('weconnecta-canva-edges', JSON.stringify(edgesData));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    };

    const loadFromLocalStorage = () => {
        try {
            const savedNodes = localStorage.getItem('weconnecta-canva-nodes');
            const savedEdges = localStorage.getItem('weconnecta-canva-edges');

            if (savedNodes && savedEdges) {
                const parsedNodes = JSON.parse(savedNodes);
                const parsedEdges = JSON.parse(savedEdges);
                return { nodes: parsedNodes, edges: parsedEdges };
            }
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
        }
        return null;
    };


    const handleNodeDoubleClick = (nodeId: string) => {
        setSelectedNodeId(nodeId);
        setIsEditMode(true);
        setIsModalOpen(true);
    };


    const handleCanvasDoubleClick = (event: any) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;


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
                label: `Conexão entre nós`
            });
            setIsDeleteModalOpen(true);
        }
    };


    const savedData = loadFromLocalStorage();
    const [nodes, setNodes] = useState(savedData?.nodes || []);
    const [edges, setEdges] = useState(savedData?.edges || []);

    // Atualizar funções onDelete dos nodes carregados do localStorage
    useEffect(() => {
        if (nodes.length > 0) {
            const updatedNodes = nodes.map((node: any) => ({
                ...node,
                data: {
                    ...node.data,
                    onDelete: () => handleNodeDelete(node.id)
                }
            }));
            setNodes(updatedNodes);
        }
    }, []); // Executa apenas uma vez na montagem


    const handleNodeDelete = (nodeId: string) => {
        console.log('🗑️ handleNodeDelete chamado para:', nodeId);
        console.log('📋 Nodes atuais:', nodes.map((n: any) => ({ id: n.id, label: n.data.label })));

        const node = nodes.find((n: any) => n.id === nodeId);
        console.log('🔍 Nó encontrado:', node ? { id: node.id, label: node.data.label } : 'NÃO ENCONTRADO');

        if (node) {
            console.log('✅ Abrindo modal de confirmação...');
            setDeleteItem({
                type: 'node',
                id: nodeId,
                label: node.data.label
            });
            setIsDeleteModalOpen(true);
        } else {
            console.error('❌ Nó não encontrado! ID:', nodeId);
        }
    };



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
            console.error('❌ Nenhum item para deletar!');
            return;
        }

        console.log('🗑️ Confirmando deleção de:', deleteItem);

        if (deleteItem.type === 'node') {
            console.log('🗑️ Deletando nó:', deleteItem.id);

            // Mostrar conexões que serão removidas
            const connectionsToRemove = edges.filter((edge: any) =>
                edge.source === deleteItem.id || edge.target === deleteItem.id
            );
            console.log('🔗 Conexões que serão removidas:', connectionsToRemove);

            // Filtrar o nó e suas conexões
            const newNodes = nodes.filter((node: any) => node.id !== deleteItem.id);
            const newEdges = edges.filter((edge: any) =>
                edge.source !== deleteItem.id && edge.target !== deleteItem.id
            );

            console.log('📊 Antes da deleção - Nodes:', nodes.length, 'Edges:', edges.length);
            console.log('📊 Depois da deleção - Nodes:', newNodes.length, 'Edges:', newEdges.length);
            console.log('🔗 Conexões removidas:', connectionsToRemove.length);

            setNodes(newNodes);
            setEdges(newEdges);
            saveToLocalStorage(newNodes, newEdges);

            console.log('✅ Nó e todas as suas conexões foram deletados com sucesso!');
        } else if (deleteItem.type === 'edge') {
            console.log('🗑️ Deletando conexão:', deleteItem.id);

            const newEdges = edges.filter((edge: any) => edge.id !== deleteItem.id);
            setEdges(newEdges);
            saveToLocalStorage(nodes, newEdges);

            console.log('✅ Conexão deletada com sucesso!');
        }

        setDeleteItem(null);
        setIsDeleteModalOpen(false);
    };


    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteItem(null);
    };


    const organizeCanvas = () => {
        console.log('Organizando canvas em formato de árvore...');


        const NODE_WIDTH = 200;
        const NODE_HEIGHT = 100;
        const LEVEL_HEIGHT = 200;
        const SIBLING_SPACING = 250;


        const rootNodes = nodes.filter((node: any) =>
            !edges.some((edge: any) => edge.target === node.id)
        );

        console.log('Nós raiz encontrados:', rootNodes);

        if (rootNodes.length === 0) {
            console.log('Nenhum nó raiz encontrado, usando primeiro nó');
            if (nodes.length > 0) {
                rootNodes.push(nodes[0]);
            }
        }


        const positionedNodes = new Map();


        const positionLeafNodes = (nodeId: string, level: number, siblingIndex: number, parentX: number = 0) => {
            const node = nodes.find((n: any) => n.id === nodeId);
            if (!node) return;

            const children = edges
                .filter((edge: any) => edge.source === nodeId)
                .map((edge: any) => edge.target);

            let x, y;

            if (children.length === 0) {

                x = parentX + (siblingIndex * SIBLING_SPACING);
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

                children.forEach((childId: any) => positionParentNodes(childId));


                const childPositions = children.map((childId: any) => positionedNodes.get(childId)).filter(Boolean);

                if (childPositions.length > 0) {
                    const minX = Math.min(...childPositions.map((pos: any) => pos.x));
                    const maxX = Math.max(...childPositions.map((pos: any) => pos.x));
                    const centerX = (minX + maxX) / 2;


                    const parentLevel = Math.min(...childPositions.map((pos: any) => pos.y)) - LEVEL_HEIGHT;

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
                    position: newPosition
                };
            }
            return node;
        });

        setNodes(updatedNodes);
        saveToLocalStorage(updatedNodes, edges);

        console.log('Canvas organizado em formato de árvore!');
    };

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => {
            const newEdges = applyEdgeChanges(changes, edges);
            setEdges(newEdges);
            saveToLocalStorage(nodes, newEdges);
            console.log('🔗 Conexões atualizadas:', changes);
        },
        [nodes, edges],
    );
    const onConnect = useCallback(
        (params: any) => {
            const newEdges = addEdge(params, edges);
            setEdges(newEdges);
            saveToLocalStorage(nodes, newEdges);
            console.log('🔗 Nova conexão criada:', params);
        },
        [nodes, edges],
    );


    const onEdgeDoubleClick = useCallback(
        (event: any, edge: any) => {
            event.preventDefault();
            event.stopPropagation();
            handleEdgeDoubleClick(edge.id);
        },
        [],
    );

    return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
            {/* Botão de salvar */}
            <div style={{ height: '97vh' }}>
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    justifyContent: 'space-between',
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    flex: 1,
                    padding: '20px',
                    paddingRight: '30px',
                    width: '-webkit-fill-available',
                }}>
                    <button
                        style={{
                            zIndex: 1000,
                            backgroundColor: '#C1C1C1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            e.currentTarget.style.backgroundColor = '#FF894E';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        < Save className='w=4 h=4' />
                        Salvar
                    </button>

                    {/* Botão de voltar ao questionario */}
                    <button
                        style={{
                            backgroundColor: '#C1C1C1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            e.currentTarget.style.backgroundColor = '#FF894E';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        < Undo2 className='w=4 h=4' />
                        Voltar
                    </button>

                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    <button
                        style={{
                            backgroundColor: '#FF894E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#C1C1C1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        < AlignJustify className='w=4 h=4' />
                    </button>

                </div>


                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    onPaneClick={(event) => {
                        if (event.detail === 2) {
                            handleCanvasDoubleClick(event);
                        }
                    }}
                    fitView
                >
                    <Background color="#FF894E" variant={BackgroundVariant.Dots} />
                </ReactFlow>

                <SurveysElementModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleModalConfirm}
                    initialData={getSelectedNodeData()}
                />

                <ConfirmDeleteModal
                    open={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    title={deleteItem?.type === 'node' ? 'Deletar Nó' : 'Deletar Conexão'}
                    message={deleteItem?.type === 'node'
                        ? `Tem certeza que deseja deletar o nó "${deleteItem?.label}"?`
                        : 'Tem certeza que deseja deletar esta conexão?'
                    }
                    itemType={deleteItem?.type === 'node' ? 'nó' : 'conexão'}
                />
            </div>
        </div>
    );
}