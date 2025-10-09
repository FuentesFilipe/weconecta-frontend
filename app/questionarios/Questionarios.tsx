'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Grid } from 'lucide-react';
import { NovoQuestionarioModal } from "@/components/Modal/NovoQuestionarioModal";
import { SurveysElementModal } from "@/components/Modal/SurveysElementModal";
import { Loading } from "@/components/ui/loading";
import { Questionario, useQuestionarios } from "@/hooks/useQuestionarios";
import { toast } from "react-toastify";
import { SurveyCard } from "../../components/SurveyCard/SurveyCard";
import styles from './page.module.css';
import { SearchBox } from '@/components/SearchBox';
import { Topbar } from '@/components/Topbar';

type QuestionariosPageProps = {
    isLoading?: boolean;
}

export default function QuestionariosPage({
    isLoading: externalIsLoading = false
}: QuestionariosPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingQuestionario, setEditingQuestionario] = useState<Questionario | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const {
        questionarios,
        isLoading: questionariosLoading,
        createQuestionario,
        updateQuestionario,
        deleteQuestionario,
        duplicateQuestionario,
        copyUrl
    } = useQuestionarios();

    const isLoading = externalIsLoading || questionariosLoading;

    // Handlers para as operações CRUD
    const handleCreateQuestionario = async (data: { title: string; description: string }) => {
        try {
            createQuestionario({
                title: data.title,
                description: data.description,
                surveyUrl: ''
            });
            toast.success('Questionário criado com sucesso!');
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Erro ao criar questionário');
        }
    };

    const handleEditQuestionario = (questionario: Questionario) => {
        setEditingQuestionario(questionario);
        setIsEditModalOpen(true);
    };

    const handleUpdateQuestionario = async (data: { title: string; description: string }) => {
        if (!editingQuestionario) return;

        try {
            updateQuestionario(editingQuestionario.id, {
                title: data.title,
                description: data.description
            });
            toast.success('Questionário atualizado com sucesso!');
            setIsEditModalOpen(false);
            setEditingQuestionario(null);
        } catch (error) {
            toast.error('Erro ao atualizar questionário');
        }
    };

    const handleDeleteQuestionario = (id: number) => {
        try {
            deleteQuestionario(id);
            toast.success('Questionário deletado com sucesso!');
        } catch (error) {
            toast.error('Erro ao deletar questionário');
        }
    };

    const handleDuplicateQuestionario = (id: number) => {
        try {
            duplicateQuestionario(id);
        } catch (error) {
            toast.error('Erro ao duplicar questionário');
        }
    };

    const handleCopyUrl = (url: string) => {
        copyUrl(url);
    };

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <h1 className="text-3xl font-bold">Questionários</h1>
                
                {/* Skeleton dos filtros */}
                <div className={styles.skeletonFilters}>
                    <div className={styles.skeletonSearch}></div>
                    <div className={styles.skeletonButton}></div>
                </div>

                {/* Spinner centralizado */}
                <div className={styles.loadingContainer}>
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            
            {/* Seção de busca e filtros */}
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <label className={styles.searchLabel}>Busca</label>
                    <div className={styles.searchInputContainer}>
                        <Search className={styles.searchIcon} />
                        <Input 
                            placeholder="Procure por um questionário"
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                
                <div className={styles.filterContainer}>
                    <label className={styles.filterLabel}>Filtrar</label>
                    <Button variant="outline" className={styles.filterButton}>
                        Adicionar Filtros
                        <Filter className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                
                <Button 
                    className={styles.newQuestionarioButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Questionário
                </Button>
            </div>
            
            {/* Card de questionários */}
            <Card className={styles.questionariosCard}>
                <div className={styles.cardsContainer}>
                    <div className={styles.cardsGrid}>
                        {questionarios.map((survey) => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                onEdit={handleEditQuestionario}
                                onDelete={handleDeleteQuestionario}
                                onDuplicate={handleDuplicateQuestionario}
                                onCopyUrl={handleCopyUrl}
                            />
                        ))}
                    </div>
                </div>
            </Card>

            {/* Modais */}
            <NovoQuestionarioModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateQuestionario}
            />
            <NovoQuestionarioModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingQuestionario(null);
                }}
                questionario={editingQuestionario}
                isEdit={true}
                onSuccess={handleUpdateQuestionario}
            />
            <SurveysElementModal
                open={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)} 
            />
        </div>
    );
}