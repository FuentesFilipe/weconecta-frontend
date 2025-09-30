import { JSX, useState } from 'react';
import { Delete as DeleteIcon, Edit as EditIcon, CopyAllTwoTone as CopyIcon, Link as CopyUrlIcon } from '@mui/icons-material'

import './index.css';
import { IconButton } from '../IconButton';
import { toast } from 'react-toastify';
import { Questionario } from '@/hooks/useQuestionarios';

type SurveyCardProps = {
    survey: Questionario;
    onEdit?: (survey: Questionario) => void;
    onDelete?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onCopyUrl?: (url: string) => void;
}


const copyUrl = (url: string): void => {
    navigator.clipboard
        .writeText(url)
        .then(() => {
            toast.info('URL copiada para a área de transferência!')
        })
        .catch((err) => {
            toast.error(err);
        });
};

export function SurveyCard({ 
    survey, 
    onEdit, 
    onDelete, 
    onDuplicate, 
    onCopyUrl 
}: SurveyCardProps): JSX.Element {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleEdit = () => {
        onEdit?.(survey);
    };

    const handleDelete = () => {
        if (showConfirmDelete) {
            onDelete?.(survey.id);
            setShowConfirmDelete(false);
        } else {
            setShowConfirmDelete(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowConfirmDelete(false), 3000);
        }
    };

    const handleDuplicate = () => {
        onDuplicate?.(survey.id);
        toast.success('Questionário duplicado com sucesso!');
    };

    const handleCopyUrl = () => {
        onCopyUrl?.(survey.surveyUrl);
        toast.info('URL copiada para a área de transferência!');
    };

    return (
        <div className='survey-card'>
            <div aria-label='buttons-container'>
                <IconButton 
                    onClick={handleEdit}
                    title="Editar questionário"
                >
                    <EditIcon />
                </IconButton>
                <IconButton 
                    onClick={handleDuplicate}
                    title="Duplicar questionário"
                >
                    <CopyIcon />
                </IconButton>
                <IconButton 
                    onClick={handleDelete}
                    title={showConfirmDelete ? "Clique novamente para confirmar" : "Deletar questionário"}
                    style={{ 
                        backgroundColor: showConfirmDelete ? '#ef4444' : 'transparent',
                        color: showConfirmDelete ? 'white' : 'inherit'
                    }}
                >
                    <DeleteIcon />
                </IconButton>
                <IconButton 
                    onClick={handleCopyUrl}
                    title="Copiar URL do questionário"
                >
                    <CopyUrlIcon />
                </IconButton>
            </div>

            <div aria-label='text-container'>
                <h3 aria-label='title'>{survey.title}</h3>
                <h3 aria-label='description'>{survey.description}</h3>
            </div>
        </div>
    );
}
