import { JSX, useState } from 'react';
import { Delete as DeleteIcon, Edit as EditIcon, CopyAllTwoTone as CopyIcon, Link as CopyUrlIcon } from '@mui/icons-material'

import './index.css';
import { IconButton } from '../IconButton';
import { toast } from 'react-toastify';

type SurveyCardProps = {
    survey: {
        id: number;
        title: string;
        description: string;
        surveyUrl: string;
    };
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

export function SurveyCard({ survey }: SurveyCardProps): JSX.Element {
    // const { mutate: editSurvey } = useSurveyEditMutation();
    // const { mutate: deleteSurvey } = useSurveyDeleteMutation();
    // const { mutate: copySurvey } = useSurveyCopyMutation();

    return (
        <div className='survey-card'>
            <div aria-label='buttons-container'>
                <IconButton onClick={() => copyUrl(survey.surveyUrl)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => copyUrl(survey.surveyUrl)}>
                    <CopyIcon />
                </IconButton>
                <IconButton onClick={() => copyUrl(survey.surveyUrl)}>
                    <DeleteIcon />
                </IconButton>
                <IconButton onClick={() => copyUrl(survey.surveyUrl)}>
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
