import React, { useState } from 'react';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CopyAllTwoTone as CopyIcon,
  Link as CopyUrlIcon,
} from '@mui/icons-material';

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
  onClick?: (survey: Questionario) => void;
  
};

export function SurveyCard({
  survey,
  onEdit,
  onDelete,
  onDuplicate,
  onCopyUrl,
  onClick,
  className = '',
}: SurveyCardProps): JSX.Element {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleCardClick = () => {
    onClick?.(survey);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(survey);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showConfirmDelete) {
      onDelete?.(survey.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(survey.id);
    toast.success('Questionário duplicado com sucesso!');
  };

  const localCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.info('URL copiada para a área de transferência!');
    } catch (err) {
      toast.error('Erro ao copiar URL');
    }
  };

  const handleCopyUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyUrl) {
      onCopyUrl(survey.surveyUrl);
    } else {
      localCopyToClipboard(survey.surveyUrl);
    }
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
          title={showConfirmDelete ? 'Clique novamente para confirmar' : 'Deletar questionário'}
          style={{
            backgroundColor: showConfirmDelete ? '#ef4444' : 'transparent',
            color: showConfirmDelete ? 'white' : 'inherit',
          }}
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
