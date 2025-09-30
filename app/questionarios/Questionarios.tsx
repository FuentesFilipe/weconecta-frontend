'use client';

import { Button } from "@/components/Button";
import { NovoQuestionarioModal } from "@/components/Modal/NovoQuestionarioModal";
import { SurveysElementModal } from "@/components/Modal/SurveysElementModal";
import { SearchBox } from "@/components/SearchBox";
import { Topbar } from "@/components/Topbar";
import { Loading } from "@/components/ui/loading";
import { Questionario, useQuestionarios } from "@/hooks/useQuestionarios";
import { Grid } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { SurveyCard } from "../../components/SurveyCard/SurveyCard";
import './index.css';

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
            <div className="w-full flex flex-col p-4 questionarios-page">
                {/* Skeleton dos filtros */}
                <div aria-label="filters">
                    <Grid dir="row" container spacing={2}>
                        <Grid size={{ xs: 10 }}>
                            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        </Grid>
                        <Grid size={{ xs: 2 }}>
                            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                        </Grid>
                    </Grid>
                </div>

                {/* Spinner centralizado */}
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col p-4 questionarios-page">
            <Topbar title="Questionários" />
            <div aria-label="filters">
                <Grid dir="row" container spacing={2}>
                    <Grid size={{ xs: 10 }}>
                        <div>
                            <SearchBox />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 2 }}>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <span>Novo questionário</span>
                        </Button>
                        {/* <Button onClick={() => setIsTestModalOpen(true)}>
                            <span>TESTE MODAL DE QUESTIONARIO</span>
                        </Button> */}
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
                            onClose={() => setIsTestModalOpen(false)} />
                    </Grid>
                </Grid>
            </div>
            <div aria-label="cards">
                <div
                    className="grid gap-4"
                >
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

        </div>
    );
}