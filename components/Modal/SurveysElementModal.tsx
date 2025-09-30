'use client';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/Input';
import { Loading } from '@/components/ui/loading';
import { SurveyElementEnum, SurveyElementType, SurveysElementsCreateDto } from '@/dtos/SurveysElementsDto';
import { useSurveysElementsCreateMutation } from '@/services/core/surveysElements/mutations';
import { Card, CardActions, CardContent, Chip, Modal } from '@mui/material';
import * as React from 'react';

type NewSurveyElementProp = {
    open: boolean
    onClose: VoidFunction
    isEdit?: number
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

export function SurveysElementModal({
    open,
    onClose,
    isEdit,
    isLoading = false,
    onConfirm,
    initialData,
}: NewSurveyElementProp) {
    const [titulo, setTitulo] = React.useState('');
    const [tipoSelecionado, setTipoSelecionado] = React.useState<SurveyElementType | null>(SurveyElementType.OPTION);
    const [alternativas, setAlternativas] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const { mutate: createSurveyElement, data: createSurveyElementResponse } = useSurveysElementsCreateMutation({
        description: titulo,
        type: tipoSelecionado,
        options: alternativas.map((alt) => ({ description: alt })),
    } as SurveysElementsCreateDto);

    React.useEffect(() => {
        if (!isEdit) {
            setTitulo('');
            setTipoSelecionado(SurveyElementType.OPTION);
            setAlternativas([]);
        }
    }, [createSurveyElementResponse]);

    const handleConfirm = () => {
        createSurveyElement();
    };

    const handleClose = () => {
        if (isLoading) return;

        setTitulo('');
        setTipoSelecionado(SurveyElementType.OPTION);
        setAlternativas([]);
        onClose();
    };

    const handleTipoClick = (tipo: SurveyElementType) => {
        if (isLoading) return;

        setTipoSelecionado(tipo);

        if (tipo === SurveyElementType.MULTIPLE_CHOICE || tipo === SurveyElementType.OPTION) {
            setAlternativas(['', '']);
        } else {
            setAlternativas([]);
        }
    };

    const handleAddAlternativa = (index: number) => {
        if (isLoading) return;
        setAlternativas([...alternativas, '']);
    };

    const handleRemoveAlternativa = (index: number) => {
        if (isLoading || alternativas.length <= 2) return;
        setAlternativas(alternativas.filter((_, i) => i !== index));
    };

    const handleAlternativaChange = (index: number, value: string) => {
        if (isLoading) return;
        const novasAlternativas = [...alternativas];
        novasAlternativas[index] = value;
        setAlternativas(novasAlternativas);
    };

    if (isLoading) {
        return (
            <Modal
                open={open}
                onClose={() => { }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            >
                <Card style={{ width: '40%', borderRadius: '16px', padding: '24px 16px', minHeight: '400px' }}>
                    <Loading />
                </Card>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
            <Card style={{ width: '40%', borderRadius: '16px', padding: '24px 16px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-orange-500">
                        {isEdit ? 'Editar Mensagem' : 'Nova Mensagem'}
                    </h4>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        disabled={isLoading}
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
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-orange-500">
                            Tipo
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {(Object.values(SurveyElementType)).map((type) => (
                                <Chip
                                    key={type}
                                    label={SurveyElementEnum[type as keyof typeof SurveyElementEnum]}
                                    clickable={!isLoading}
                                    style={{
                                        backgroundColor: tipoSelecionado === (type as unknown as SurveyElementType) ? '#f97316' : '#e5e7eb',
                                        color: tipoSelecionado === (type as unknown as SurveyElementType) ? 'white' : '#374151',
                                        opacity: isLoading ? 0.5 : 1,
                                        cursor: isLoading ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => handleTipoClick(type)}
                                />
                            ))}
                        </div>
                    </div>

                    {(tipoSelecionado === SurveyElementType.MULTIPLE_CHOICE ||
                        tipoSelecionado === SurveyElementType.OPTION) && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-orange-500">
                                    Alternativas
                                </label>
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                    {alternativas.map((alternativa, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Digite uma alternativa aqui"
                                                value={alternativa}
                                                onChange={(e) => handleAlternativaChange(index, e.target.value)}
                                                disabled={isLoading}
                                            />
                                            {alternativas.length - 1 === index && (
                                                <IconButton
                                                    onClick={() => handleAddAlternativa(index)}
                                                    disabled={isLoading}
                                                >
                                                    <span>+</span>
                                                </IconButton>
                                            )}
                                            {alternativas.length > 2 && (
                                                <IconButton
                                                    onClick={() => handleRemoveAlternativa(index)}
                                                    disabled={isLoading}
                                                >
                                                    <span>-</span>
                                                </IconButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </CardContent>

                <CardActions>
                    <Button onClick={onClose}><span>Cancelar</span></Button>
                    <Button onClick={handleConfirm}><span>{isEdit ? 'Salvar' : 'Criar'}</span></Button>
                </CardActions>
            </Card>
        </Modal>
    );
}