'use client';

import { Input } from '@/components/Input';
import { ConfirmDeleteModal } from '@/components/Modal/ConfirmDeleteModal';
import { SurveysElementModal } from '@/components/Modal/SurveysElementModal';
import { ArrowRight as ArrowRightIcon, Clear as ClearIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, ReactFlow, ReactFlowProvider, SelectionMode, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Undo2 } from 'lucide-react';
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accordion } from '../../../components/Accordion';
import SpeedDialTooltipOpen, { CanvaActionsType } from '../../../components/SpeedDial/speeddialtest';
import { SurveyElementDto } from '../../../dtos/SurveysElementsDto';
import { useGetAllSurveysElements } from '../../../services/core/surveysElements/queries';
import CustomNode from './CustomNode';
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
    const pathname = usePathname();
    const router = useRouter();
    const { fitView } = useReactFlow();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            setSearchTerm(value);
        }, 400);
    };

    const { data: surveysElements } = useGetAllSurveysElements({ description: searchTerm });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingElementModal, setEditingElementModal] = useState<{ isOpen: boolean; surveyElement: SurveyElementDto }>
        ({ isOpen: false, surveyElement: null as any });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [deleteItem, setDeleteItem] = useState<{
        type: 'node' | 'edge';
        id: string;
        label?: string;
    } | null>(null);

    const handleGoBack = () => {
        const segments = pathname.split("/").filter(Boolean);
        segments.pop();
        const newPath = "/" + segments.join("/");
        router.push(newPath || "/");
    };

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

        setNodes((prevNodes: any) => [...prevNodes, newNode]);
        saveToLocalStorage([...nodes, newNode], edges);

        setSelectedNodeId(newNodeId);
        setEditingElementModal({ isOpen: false, surveyElement: null as any });
    };


    const getSelectedNodeData = () => {
        if (editingElementModal.isOpen && editingElementModal.surveyElement) {
            return {
                label: editingElementModal.surveyElement.description,
                type: editingElementModal.surveyElement.type,
                maxEdges: editingElementModal.surveyElement.options?.length || 2
            };
        }

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



    const ensureNodeFunctions = (nodeList: any[]) => {
        return nodeList.map((node: any) => ({
            ...node,
            data: {
                ...node.data,
                onDelete: () => handleNodeDelete(node.id),
                onDoubleClick: () => handleNodeDoubleClick(node.id)
            }
        }));
    };

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
        setEditingElementModal({ isOpen: false, surveyElement: null as any });
    };


    const handleModalConfirm = (modalData: {
        titulo: string;
        tipo: string;
        alternativas: string[];
    }) => {
        if (editingElementModal.isOpen && editingElementModal.surveyElement) {
            console.log('Atualizando elemento da sidebar:', editingElementModal.surveyElement);
            setEditingElementModal({ isOpen: false, surveyElement: null as any });
            handleCloseModal();
            return;
        }

        if (selectedNodeId && isEditMode) {
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
        } else {
            const newNodeId = `node-${Date.now()}`;
            const nodeType: 'mensagem' | 'alternativa' | 'input' | 'fim' = 'mensagem';

            const newNode = {
                id: newNodeId,
                type: 'customNode',
                position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
                data: {
                    label: modalData.titulo,
                    type: nodeType,
                    maxEdges: modalData.tipo === 'MultiplaEscolha' || modalData.tipo === 'Alternativa'
                        ? modalData.alternativas.length
                        : (modalData.tipo === 'Input' ? 1 : 2),
                    onClick: () => console.log('Clique no novo nó'),
                    onDoubleClick: () => handleNodeDoubleClick(newNodeId),
                    onDelete: () => handleNodeDelete(newNodeId)
                }
            };

            if (modalData.tipo === 'MultiplaEscolha' || modalData.tipo === 'Alternativa') {
                const alternativeNodes = modalData.alternativas
                    .filter(alt => alt.trim() !== '')
                    .map((alternativa, index) => ({
                        id: `${newNodeId}-alt-${index}`,
                        type: 'customNode',
                        position: {
                            x: newNode.position.x + (index * 200),
                            y: newNode.position.y + 150
                        },
                        data: {
                            label: alternativa,
                            type: 'alternativa' as const,
                            maxEdges: 1,
                            onClick: () => console.log('Clique na alternativa:', alternativa),
                            onDoubleClick: () => handleNodeDoubleClick(`${newNodeId}-alt-${index}`),
                            onDelete: () => handleNodeDelete(`${newNodeId}-alt-${index}`)
                        }
                    }));

                const alternativeEdges = alternativeNodes.map((node: any) => ({
                    id: `${newNodeId}-to-${node.id}`,
                    source: newNodeId,
                    target: node.id
                }));

                const allNewNodes = [newNode, ...alternativeNodes];
                const allNewEdges = alternativeEdges;

                setNodes((prev: any) => [...prev, ...allNewNodes]);
                setEdges((prev: any) => [...prev, ...allNewEdges]);
                saveToLocalStorage([...nodes, ...allNewNodes], [...edges, ...allNewEdges]);
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
    };

    useEffect(() => {
        console.log(editingElementModal)
    }, [editingElementModal])


    const handleConfirmDelete = () => {
        if (!deleteItem) {
            console.error('❌ Nenhum item para deletar!');
            return;
        }

        console.log('🗑️ Confirmando deleção de:', deleteItem);

        if (deleteItem.type === 'node') {
            if (deleteItem.id === 'multiple') {
                handleConfirmMultipleDelete();
                return;
            } else {
                console.log('🗑️ Deletando nó:', deleteItem.id);

                const connectionsToRemove = edges.filter((edge: any) =>
                    edge.source === deleteItem.id || edge.target === deleteItem.id
                );
                console.log('🔗 Conexões que serão removidas:', connectionsToRemove);

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
            }
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

        setTimeout(() => {
            fitView({ padding: 0.1, duration: 800 });
        }, 100);

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

    const handleDrop = useCallback((event: any) => {
        event.preventDefault();

        try {
            const elementData = JSON.parse(event.dataTransfer.getData('application/json'));

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top
            };

            console.log('Drop realizado em:', position, 'com elemento:', elementData);

            handleInsertOnCanvaAtPosition(elementData, position);

        } catch (error) {
            console.error('Erro ao processar drop:', error);
        }
    }, []);

    const handleDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleInsertOnCanvaAtPosition = (element: any, position: { x: number, y: number }) => {
        console.log('Inserindo elemento na posição:', position);

        const newNodeId = `node-${Date.now()}`;

        const newNode = {
            id: newNodeId,
            type: 'customNode',
            position: position,
            data: {
                label: element.description,
                type: 'mensagem' as const,
                maxEdges: element.options?.length > 0 ? element.options.length : 2,
                onClick: () => console.log('Clique no novo nó'),
                onDoubleClick: () => handleNodeDoubleClick(newNodeId),
                onDelete: () => handleNodeDelete(newNodeId)
            }
        };

        const newNodes = [newNode];
        const newEdges: any[] = [];

        if (element.options && element.options.length > 0) {
            element.options.forEach((option: any, index: number) => {
                const childNodeId = `${newNodeId}-child-${index}`;
                const childNode = {
                    id: childNodeId,
                    type: 'customNode',
                    position: {
                        x: position.x + (index * 200),
                        y: position.y + 150
                    },
                    data: {
                        label: option.description,
                        type: 'alternativa' as const,
                        maxEdges: 1,
                        onClick: () => console.log('Clique na alternativa:', option.description),
                        onDoubleClick: () => handleNodeDoubleClick(childNodeId),
                        onDelete: () => handleNodeDelete(childNodeId)
                    }
                };

                const edge = {
                    id: `${newNodeId}-to-${childNodeId}`,
                    source: newNodeId,
                    target: childNodeId
                };

                newNodes.push(childNode as any);
                newEdges.push(edge);
            });
        }

        setNodes((prevNodes: any) => [...prevNodes, ...newNodes]);
        setEdges((prevEdges: any) => [...prevEdges, ...newEdges]);

        saveToLocalStorage([...nodes, ...newNodes], [...edges, ...newEdges]);

        console.log('✅ Elemento inserido no canvas na posição:', {
            position,
            mainNode: newNode,
            childNodes: newNodes.slice(1),
            edges: newEdges
        });
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodes.length > 0) {
            handleDeleteMultipleNodes();
        }
    }, [selectedNodes]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleSelectionChange = useCallback(({ nodes: selectedNodesList }: { nodes: any[] }) => {
        const selectedIds = selectedNodesList.map(node => node.id);
        setSelectedNodes(selectedIds);
        console.log('Nós selecionados:', selectedIds);
    }, []);

    const handleDeleteMultipleNodes = () => {
        if (selectedNodes.length === 0) return;

        const nodesToDelete = nodes.filter((node: any) => selectedNodes.includes(node.id));
        const nodeLabels = nodesToDelete.map((node: any) => node.data.label).join(', ');

        setDeleteItem({
            type: 'node',
            id: 'multiple',
            label: `Múltiplos nós: ${nodeLabels}`
        });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmMultipleDelete = () => {
        const updatedNodes = nodes.filter((node: any) => !selectedNodes.includes(node.id));

        const updatedEdges = edges.filter((edge: any) =>
            !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        );

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        saveToLocalStorage(updatedNodes, updatedEdges);

        setSelectedNodes([]);
        setIsDeleteModalOpen(false);
        setDeleteItem(null);

        console.log(`✅ ${selectedNodes.length} nós deletados com sucesso!`);
    };

    const handleEditSidebarElement = (element: any) => {
        console.log('Editando elemento da sidebar:', element);
        setEditingElementModal({ isOpen: true, surveyElement: element });
        setSelectedNodeId(null);
        setIsEditMode(false);
    };

    const handleInsertOnCanva = (element: any) => {
        console.log('Inserindo elemento no canvas:', element);
        console.log('Element ID:', element.id);
        console.log('Element description:', element.description);

        const newNodeId = `node-${Date.now()}`;
        const basePosition = { x: 250, y: 250 };

        const newNode = {
            id: newNodeId,
            type: 'customNode',
            position: basePosition,
            data: {
                label: element.description,
                type: 'mensagem' as const,
                maxEdges: element.options?.length > 0 ? element.options.length : 2,
                onClick: () => console.log('Clique no novo nó'),
                onDoubleClick: () => handleNodeDoubleClick(newNodeId),
                onDelete: () => handleNodeDelete(newNodeId)
            }
        };

        const newNodes = [newNode];
        const newEdges: any[] = [];

        if (element.options && element.options.length > 0) {
            element.options.forEach((option: any, index: number) => {
                const childNodeId = `${newNodeId}-child-${index}`;
                const childNode = {
                    id: childNodeId,
                    type: 'customNode',
                    position: {
                        x: basePosition.x + (index * 200),
                        y: basePosition.y + 150
                    },
                    data: {
                        label: option.description,
                        type: 'alternativa' as const,
                        maxEdges: 1,
                        onClick: () => console.log('Clique na alternativa:', option.description),
                        onDoubleClick: () => handleNodeDoubleClick(childNodeId),
                        onDelete: () => handleNodeDelete(childNodeId)
                    }
                };

                const edge = {
                    id: `${newNodeId}-to-${childNodeId}`,
                    source: newNodeId,
                    target: childNodeId
                };

                newNodes.push(childNode as any);
                newEdges.push(edge);
            });
        }

        setNodes((prevNodes: any) => [...prevNodes, ...newNodes]);
        setEdges((prevEdges: any) => [...prevEdges, ...newEdges]);

        saveToLocalStorage([...nodes, ...newNodes], [...edges, ...newEdges]);

        console.log('✅ Elemento inserido no canvas com filhos conectados:', {
            mainNode: newNode,
            childNodes: newNodes.slice(1),
            edges: newEdges
        });
    }

    return (
        <div className="canvas-layout-container">
            <aside className={`canvas-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <div className="canvas-sidebar-header">
                    <div className="canvas-sidebar-logo">
                        <img src='/logo_padrao_horizontal.png' alt="WeConecta" />
                    </div>
                    <button
                        className="canvas-sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <div className="canvas-sidebar-content">
                    <div className="canvas-sidebar-section">
                        <h3 className="canvas-sidebar-title">Mensagem</h3>
                        <Input
                            placeholder='Pesquisar por Elementos do Questionário'
                            onChange={onInputChange}
                        />
                    </div>

                    <div className='canvas-options-list'>
                        {surveysElements?.map((element) => (
                            <div
                                key={element.id}
                                className="canvas-option-item"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/json', JSON.stringify(element));
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                            >
                                <div className="canvas-option-content">
                                    <Accordion
                                        key={element.id}
                                        description={element.description}
                                        expandable={element.options && element.options.length > 0}
                                    >
                                        {element.options && element.options.length > 0 ? (
                                            <ul>
                                                {element.options.map((option) => (
                                                    <li key={option.id}>{option.description}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="canvas-option-subtitle">
                                                {element.type === 'OPTION' ? 'Alternativa' :
                                                    element.type === 'MULTIPLE_CHOICE' ? 'Múltipla escolha' :
                                                        element.type === 'INPUT' ? 'Campo de entrada' :
                                                            element.type === 'MESSAGE' ? 'Mensagem' : 'Elemento'}
                                            </div>
                                        )}
                                    </Accordion>
                                </div>
                                <div className="canvas-option-actions">
                                    <IconButton
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEditSidebarElement(element);
                                        }}
                                        className="canvas-edit-button"
                                        title="Editar elemento"
                                    >
                                        <EditIcon style={{ width: '1rem', height: '1rem' }} />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Botão clicado para elemento:', element);
                                            handleInsertOnCanva(element);
                                        }}
                                        className="canvas-option-button"
                                        title="Adicionar ao canvas"
                                    >
                                        <ArrowRightIcon />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="canvas-sidebar-footer">
                        {selectedNodes.length > 0 && (
                            <div className="selection-info">
                                <div className="selection-header">
                                    <div className="selection-count">
                                        {selectedNodes.length} selecionado{selectedNodes.length > 1 ? 's' : ''}
                                    </div>
                                    <IconButton
                                        className="clear-selection-btn"
                                        onClick={() => setSelectedNodes([])}
                                        title="Limpar seleção"
                                        size="small"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </div>
                                <IconButton
                                    className="delete-selected-btn"
                                    onClick={handleDeleteMultipleNodes}
                                    title="Deletar selecionados (Delete/Backspace)"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        )}
                        <button
                            className="canvas-new-message-btn"
                            onClick={() => setEditingElementModal({ isOpen: true, surveyElement: null as any })}
                        >
                            Nova Mensagem
                        </button>
                    </div>
                </div>
            </aside >

            <div className="canvas-main-content">
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
                            onClick={handleGoBack}
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
                            bottom: '30px',
                            right: '30px',
                            zIndex: 1000
                        }}
                    >
                        <SpeedDialTooltipOpen canvaActions={{
                            [CanvaActionsType.NEW_MESSAGE]: () => setEditingElementModal({ isOpen: true, surveyElement: null as any }),
                            [CanvaActionsType.SAVE_CANVA]: () => console.log('Salvar'),
                            [CanvaActionsType.ORGANIZE_CANVA]: organizeCanvas,
                        }} />
                        {/* <button
                        style={{
                            backgroundColor: '#FF894E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        < AlignJustify className='w=4 h=4' />
                    </button> */}

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
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onSelectionChange={handleSelectionChange}
                        selectionMode={SelectionMode.Partial}
                        multiSelectionKeyCode={['Shift']}
                        deleteKeyCode={['Delete', 'Backspace']}
                        fitView
                    >
                        <Background color="#FF894E" variant={BackgroundVariant.Dots} />
                    </ReactFlow>

                    {editingElementModal.isOpen &&
                        <SurveysElementModal
                            open={editingElementModal.isOpen}
                            onClose={handleCloseModal}
                            onConfirm={handleModalConfirm}
                            id={editingElementModal?.surveyElement ? editingElementModal?.surveyElement?.id : undefined}
                        />}

                    <ConfirmDeleteModal
                        open={isDeleteModalOpen}
                        onClose={handleCloseDeleteModal}
                        onConfirm={handleConfirmDelete}
                        title={deleteItem?.type === 'node'
                            ? (deleteItem?.id === 'multiple' ? 'Deletar Nós Selecionados' : 'Deletar Nó')
                            : 'Deletar Conexão'
                        }
                        message={deleteItem?.type === 'node'
                            ? (deleteItem?.id === 'multiple'
                                ? `Tem certeza que deseja deletar ${selectedNodes.length} nós selecionados?\n\n${deleteItem?.label}`
                                : `Tem certeza que deseja deletar o nó "${deleteItem?.label}"?`)
                            : 'Tem certeza que deseja deletar esta conexão?'
                        }
                        itemType={deleteItem?.type === 'node' ? 'nó' : 'conexão'}
                    />
                </div>
            </div>
        </div >
    );
}