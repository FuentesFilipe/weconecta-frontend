import {
    CopyAllTwoTone as CopyIcon,
    Link as CopyUrlIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import React, { JSX } from 'react';

import { SurveyDto } from '@/dtos/SurveyDto';
import { toast } from 'react-toastify';
import { useSurveysCreateMutation, useSurveysDeleteMutation } from '../../services/core/surveys/mutations';
import { IconButton } from '../IconButton';
import './index.css';

type SurveyCardProps = {
    survey: SurveyDto;
    onEdit?: (surveyId: number) => void;
    onClick?: (survey: SurveyDto) => void;
    className?: string;

};

export function SurveyCard({
    survey,
    onEdit,
    onClick,
    className = '',
}: SurveyCardProps): JSX.Element {

    const {
        mutate: deleteQuestionarioMutate,
    } = useSurveysDeleteMutation(survey);

    const { mutate: createSurveyElement } = useSurveysCreateMutation({
        ...survey,
        id: undefined,
        title: `${survey.title} (Cópia)`,
        url: ''
    });


    const handleCardClick = () => {
        onClick?.(survey);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(survey.id!);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTimeout(() => deleteQuestionarioMutate(), 100);
    };

    const handleDuplicateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        createSurveyElement();
        toast.success('Questionário duplicado com sucesso!');
    };

    const handleCopyUrlClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard
            .writeText(survey.url)
            .then(() => {
                toast.info('URL copiada para a área de transferência!');
            })
            .catch((err) => {
                console.error('Erro ao copiar URL:', err);
            });
    };

    return (
        <div className={`survey-card ${className}`} onClick={handleCardClick}>
            <div aria-label="buttons-container">
                <IconButton onClick={handleEditClick} title="Editar questionário">
                    <EditIcon />
                </IconButton>

                <IconButton onClick={handleDuplicateClick} title="Duplicar questionário">
                    <CopyIcon />
                </IconButton>

                <IconButton
                    onClick={handleDeleteClick}
                >
                    <DeleteIcon />
                </IconButton>

                <IconButton onClick={handleCopyUrlClick} title="Copiar URL do questionário">
                    <CopyUrlIcon />
                </IconButton>
            </div>

            <div aria-label="text-container">
                <h3 aria-label="title">{survey.title}</h3>
                <h3 aria-label="description">{survey.description}</h3>
            </div>
        </div>
    );
}
