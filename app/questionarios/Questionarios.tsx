'use client';

import { SurveysElementModal } from "@/components/Modal/SurveysElementModal";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Input } from "../../components/Input";
import { SurveysModal } from "../../components/Modal/SurveysModal";
import { SurveyCard } from "../../components/SurveyCard/SurveyCard";
import { SurveyDto } from "../../dtos/SurveyDto";
import { useGetAllSurveys } from "../../services/core/surveys/queries";
import styles from './page.module.css';

type QuestionariosPageProps = {
    isLoading?: boolean;
}

export default function QuestionariosPage({
    isLoading: externalIsLoading = false
}: QuestionariosPageProps) {
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingQuestionarioId, setEditingQuestionarioId] = useState<{ id: number | null; isOpen: boolean }>({ id: null, isOpen: false });

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


    const {
        data: questionarios,
        isLoading: questionariosLoading,
    } = useGetAllSurveys({ search: searchTerm });

    const router = useRouter();

    const handleRedirectToCanva = (survey: SurveyDto) => {
        router.push(`/questionarios/canva?id=${survey.id}`);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <label className={styles.searchLabel}>Busca</label>
                    <div className={styles.searchInputContainer}>
                        <Input placeholder='Pesquisar por Questionários' onChange={onInputChange} />
                    </div>
                </div>

                <div className={styles.filterContainer}>
                    <label className={styles.filterLabel}>Filtrar</label>
                    <Button variant="outline" className={styles.filterButton}>
                        Adicionar Filtros
                        <Filter className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <Button className={styles.newQuestionarioButton} onClick={() => setEditingQuestionarioId({ id: null, isOpen: true })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Questionário
                </Button>
            </div>

            <Card className={styles.questionariosCard}>
                <div className={styles.cardsGrid}>
                    {questionarios && questionarios[0].length ? questionarios[0].map((survey) => (
                        <SurveyCard
                            key={survey.id}
                            survey={survey}
                            className={styles.surveyCard}
                            onEdit={(surveyId: number) => {
                                setEditingQuestionarioId({ id: surveyId, isOpen: true });
                            }}
                            onClick={handleRedirectToCanva}
                        />
                    )) : <></>}
                </div>
            </Card>

            {/* Modais */}
            {editingQuestionarioId.isOpen && <SurveysModal
                open={editingQuestionarioId.isOpen}
                onClose={() => {
                    setEditingQuestionarioId({ id: null, isOpen: false });
                }}
                id={editingQuestionarioId.id}
            />}
            <SurveysElementModal open={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
        </div>
    );
}
