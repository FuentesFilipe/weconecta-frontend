'use client';

import { SurveysElementModal } from '@/components/Modal/SurveysElementModal';
import SpeechBubble from '@/components/SpeechBubble';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SurveyElementType } from '@/dtos/SurveysElementsDto';
import { Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { SurveysModal } from '../../components/Modal/SurveysModal';
import { SurveyCard } from '../../components/SurveyCard/SurveyCard';
import { SurveyDto } from '../../dtos/SurveyDto';
import { useGetAllSurveys } from '../../services/core/surveys/queries';
import styles from './page.module.css';

export default function QuestionariosPage() {
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingQuestionarioId, setEditingQuestionarioId] = useState<{
        id: number | null;
        isOpen: boolean;
    }>({ id: null, isOpen: false });

    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setInputValue(value);

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            setSearchTerm(value);
        }, 400);
    };

    const { data: questionarios, isLoading: questionariosLoading } =
        useGetAllSurveys({ search: searchTerm });

    const router = useRouter();

    const handleRedirectToCanva = (survey: SurveyDto) => {
        router.push(`/questionarios/canva?id=${survey.id}`);
    };

    // Dev/test bubble elements (kept here so handlers can reference options)
    const optionBubbleElement = {
        id: 500,
        description: 'Você possui alguma dor na região da lombar?',
        type: SurveyElementType.OPTION,
        options: [
            { id: 1, description: 'Sim' },
            { id: 2, description: 'Não' },
        ],
    } as const;

    const inputBubbleElement = {
        id: 501,
        description: 'Descreva a intensidade da sua dor:',
        type: SurveyElementType.INPUT,
        options: [],
    } as const;

    const [userResponses, setUserResponses] = useState<{
        text: string;
        align: 'left' | 'right';
    }[]>([]);

    const questionAlign: 'left' | 'right' = 'right';

    const oppositeAlign = (a: 'left' | 'right') => (a === 'left' ? 'right' : 'left');

    const handleOptionBubbleSend = (payload: unknown) => {
        const val = (payload as { value?: unknown }).value;
        let text = '';
        if (typeof val === 'number') {
            const opt = optionBubbleElement.options.find((o) => o.id === val);
            text = opt?.description ?? String(val);
        } else if (Array.isArray(val)) {
            text = (val as number[])
                .map((id) => optionBubbleElement.options.find((o) => o.id === id)?.description ?? String(id))
                .join(', ');
        } else if (typeof val === 'string') {
            text = val;
        } else {
            text = '';
        }
        setUserResponses((prev) => [...prev, { text, align: oppositeAlign(questionAlign) }]);
    };

    const handleInputBubbleSend = (payload: unknown) => {
        const val = (payload as { value?: unknown }).value;
        const text = typeof val === 'string' ? val : '';
        setUserResponses((prev) => [...prev, { text, align: oppositeAlign(questionAlign) }]);
    };

    return (
        <div className={styles.pageContainer}>
            {/* Seção de busca e filtros */}
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <label className={styles.searchLabel}></label>
                    <div className={styles.searchInputContainer}>
                        <Input
                            placeholder='Pesquisar por Questionários'
                            onChange={onInputChange}
                        />
                    </div>
                </div>

                <div className={styles.filterContainer}>
                    <label className={styles.filterLabel}>Filtrar</label>
                    <Button variant='outline' className={styles.filterButton}>
                        Adicionar Filtros
                        <Filter className='ml-2 h-4 w-4' />
                    </Button>
                </div>

                <Button
                    className={styles.newQuestionarioButton}
                    onClick={() =>
                        setEditingQuestionarioId({ id: null, isOpen: true })
                    }
                >
                    <Plus className='mr-2 h-4 w-4' />
                    Novo Questionário
                </Button>
            </div>

            <Card className={styles.questionariosCard}>
                <div className={styles.cardsGrid}>
                    {questionarios && questionarios[0].length ? (
                        questionarios[0].map((survey) => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                className={styles.surveyCard}
                                onEdit={(surveyId: number) => {
                                    setEditingQuestionarioId({
                                        id: surveyId,
                                        isOpen: true,
                                    });
                                }}
                                onClick={handleRedirectToCanva}
                            />
                        ))
                    ) : (
                        <></>
                    )}
                </div>
            </Card>

            {/* Modais */}
            {editingQuestionarioId.isOpen && (
                <SurveysModal
                    open={editingQuestionarioId.isOpen}
                    onClose={() => {
                        setEditingQuestionarioId({ id: null, isOpen: false });
                    }}
                    id={editingQuestionarioId.id || undefined}
                />
            )}
            <SurveysElementModal
                open={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
            />
            {/* Overlay SpeechBubble (dev/test) - fixed on top-right stacked column */}
            <div
                style={{
                    position: 'fixed',
                    left: 24,
                    right: 24,
                    top: 24,
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    alignItems: 'stretch',
                }}
            >
                <SpeechBubble
                    element={
                        {
                            id: 500,
                            description:
                                'Você possui alguma dor na região da lombar?',
                            type: SurveyElementType.OPTION,
                            options: [
                                { id: 1, description: 'Sim' },
                                { id: 2, description: 'Não' },
                            ],
                        } as any
                    }
                    isQuestion
                    surveyId={123}
                    onSend={(p) => {
                        handleOptionBubbleSend(p);
                    }}
                    align='right'
                />

                <SpeechBubble
                    element={
                        {
                            id: 501,
                            description: 'Descreva a intensidade da sua dor:',
                            type: SurveyElementType.INPUT,
                            options: [],
                        } as any
                    }
                    isQuestion
                    surveyId={123}
                    onSend={(p) => {
                        handleInputBubbleSend(p);
                    }}
                    align='right'
                />
                {userResponses.map((r, i) => (
                    <div key={`resp-${i}`} style={{ width: '100%' }}>
                        <SpeechBubble isQuestion={false} responseText={r.text} align={r.align} />
                    </div>
                ))}
            </div>
        </div>
    );
}
