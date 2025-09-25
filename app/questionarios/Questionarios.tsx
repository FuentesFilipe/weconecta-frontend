'use client';

import { Button } from "@/components/Button";
import { NovaMensagemModal } from "@/components/Modal/NovaMensagemModal";
import { NovoQuestionarioModal } from "@/components/Modal/NovoQuestionarioModal";
import { SearchBox } from "@/components/SearchBox";
import { Grid } from "@mui/material";
import { useState } from "react";
import { SurveyCard } from "../../components/SurveyCard/SurveyCard";
import { surveysMock } from "../../components/SurveyCard/mockData";
import './index.css';
import { Topbar } from "@/components/Topbar";

type QuestionariosPageProps = {
    isLoading?: boolean;
}

export default function QuestionariosPage({
    isLoading = false
}: QuestionariosPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);


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
                        <Button onClick={() => setIsTestModalOpen(true)}>
                            <span>TESTE MODAL DE QUESTIONARIO</span>
                        </Button>
                        <NovoQuestionarioModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
                        <NovaMensagemModal open={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
                    </Grid>
                </Grid>
            </div>
            <div aria-label="cards">
                <div
                    className="grid gap-4"
                >
                    {surveysMock.map((survey) => (
                        <SurveyCard key={survey.id} survey={survey} />
                    ))}
                </div>
            </div>

        </div>
    );
}