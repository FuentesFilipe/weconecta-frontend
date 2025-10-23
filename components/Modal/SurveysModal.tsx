'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardActions, CardContent, Modal } from '@mui/material';
import * as React from 'react';
import { SurveyDto } from '../../dtos/SurveyDto';
import { useSurveysCreateMutation } from '../../services/core/surveys/mutations';
import { useGetSurveysById } from '../../services/core/surveys/queries';
import { queryClient } from '../../services/query-client';
import QUERY_KEYS from '../../utils/contants/queries';
import { Loading } from '../ui';
import './index.css';

type NewSurveyElementProp = {
    open: boolean
    onClose: VoidFunction
    isLoading?: boolean
    id?: number
    onConfirm?: (data: {
        titulo: string;
        tipo: string;
        alternativas: string[];
    }) => void
    initialData?: {
        label: string;
        type: string;
        maxEdges?: number;
    } | null
}

const DEFAULT_DATA = {
    description: '',
    title: '',
    id: undefined,
    url: ''
}

function CreateEditSurvey({ open, onClose, data, id }: { open: boolean, onClose: VoidFunction, data: SurveyDto, id?: number }) {
    const [form, setForm] = React.useState<SurveyDto>({ ...data });

    const { mutate: createSurveyElement, data: createSurveyElementResponse } = useSurveysCreateMutation(form);

    React.useEffect(() => {
        if (data) {
            setForm({ ...data });
        }
    }, [data]);

    React.useEffect(() => {
        if (!id) {
            setForm({ ...DEFAULT_DATA });
        }

        if (createSurveyElementResponse) {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS, id] });
        }
    }, [createSurveyElementResponse]);

    const handleConfirm = () => {
        createSurveyElement();
    };

    const handleClose = () => {
        setForm({ ...data });
        onClose();
    };

    const onDescriptionChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            description: value,
        }));
    };


    const onTitleChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            title: value,
        }));
    };

    return (
        <Modal className="modal-survey-element" open={open} onClose={handleClose} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <Card style={{ width: '40%', borderRadius: '16px', padding: '24px 16px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-orange-500">
                        {id ? 'Editar Questionário' : 'Novo Questionário'}
                    </h4>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        disabled={false}
                    >
                        ×
                    </button>
                </div>

                <CardContent className="flex flex-col gap-4">
                    <label className="text-sm font-medium text-orange-500">
                        Título
                    </label>
                    <Input
                        placeholder="Digite um título aqui"
                        value={form.title}
                        onChange={(e) => onTitleChange(e.target.value)}
                    />

                    <label className="text-sm font-medium text-orange-500">
                        Descrição
                    </label>
                    <Input
                        placeholder="Digite uma descrição aqui"
                        value={form.description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                    />

                </CardContent>

                <CardActions>
                    <Button onClick={onClose}><span>Cancelar</span></Button>
                    <Button onClick={handleConfirm}><span>{!!id ? 'Salvar' : 'Criar'}</span></Button>
                </CardActions>
            </Card>
        </Modal>
    );

}

export function SurveysModal({
    open,
    onClose,
    id
}: NewSurveyElementProp) {
    const { data: surveyData, isFetching: surveyLoading } = useGetSurveysById(id);

    if (surveyLoading || (id && !surveyData)) {
        return (
            <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
                <Loading />
            </Modal>
        )
    }

    return <CreateEditSurvey open={open} onClose={onClose} id={id} data={!!id ? (surveyData || DEFAULT_DATA) : DEFAULT_DATA} />
}