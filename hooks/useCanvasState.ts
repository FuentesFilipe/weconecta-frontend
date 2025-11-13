'use client';

import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { useCallback, useRef, useState } from 'react';

export interface DeleteItem {
    type: 'node' | 'edge';
    id: string;
    label?: string;
}

export interface EditingElementModal {
    isOpen: boolean;
    surveyElement: SurveyElementDto | null;
}

export function useCanvasState() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingElementModal, setEditingElementModal] =
        useState<EditingElementModal>({
            isOpen: false,
            surveyElement: null,
        });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [deleteItem, setDeleteItem] = useState<DeleteItem | null>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const onInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }

            typingTimeout.current = setTimeout(() => {
                setSearchTerm(value);
            }, 400);
        },
        [],
    );

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedNodeId(null);
        setEditingElementModal({ isOpen: false, surveyElement: null });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setDeleteItem(null);
    }, []);

    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
        setIsEditMode(true);
        setIsModalOpen(true);
    }, []);

    const handleEditSidebarElement = useCallback(
        (element: SurveyElementDto) => {
            console.log('✏️ handleEditSidebarElement chamado:', {
                element,
                elementId: element?.id,
                elementDescription: element?.description,
            });
            if (!element || !element.id) {
                console.error('❌ Elemento inválido ou sem ID:', element);
                return;
            }
            setEditingElementModal({ isOpen: true, surveyElement: element });
            setSelectedNodeId(null);
            setIsEditMode(false);
            console.log('✅ Modal de edição aberto para elemento:', element.id);
        },
        [],
    );

    const handleNewMessage = useCallback(() => {
        setEditingElementModal({ isOpen: true, surveyElement: null });
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedNodes([]);
    }, []);

    return {
        // Estado
        sidebarOpen,
        setSidebarOpen,
        searchTerm,
        isModalOpen,
        selectedNodeId,
        setSelectedNodeId,
        isEditMode,
        setIsEditMode,
        editingElementModal,
        setEditingElementModal,
        isDeleteModalOpen,
        selectedNodes,
        setSelectedNodes,
        deleteItem,
        setDeleteItem,
        // Handlers
        onInputChange,
        handleCloseModal,
        handleCloseDeleteModal,
        handleNodeDoubleClick,
        handleEditSidebarElement,
        handleNewMessage,
        handleClearSelection,

        // Setters
        setIsModalOpen,
        setIsDeleteModalOpen,
    };
}
