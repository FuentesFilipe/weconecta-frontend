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

export default function QuestionariosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    return (
        <div className="w-full flex flex-col p-4 questionarios-page">
            {/* <Topbar title="aaaa" /> */}
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








