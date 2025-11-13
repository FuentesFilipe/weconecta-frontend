'use client';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/Input';
import { SurveyElementDto, SurveyElementEnum, SurveyElementOption, SurveyElementType, SurveysElementsCreateDto } from '@/dtos/SurveysElementsDto';
import { useSurveysElementsCreateMutation, useSurveysElementsUpdateMutation } from '@/services/core/surveysElements/mutations';
import { Add as AddIcon, Delete as DeleteIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { Card, CardActions, CardContent, Chip, Modal } from '@mui/material';
import * as React from 'react';
import { toast } from 'react-toastify';
import { useGetSurveysElementById } from '../../services/core/surveysElements/queries';
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
        label?: string;
        type?: string;
        maxEdges?: number;
        options?: string[];
    } | null
}

const DEFAULT_DATA = {
    description: '',
    type: SurveyElementType.OPTION,
    options: [{ description: '' }, { description: '' }],
}

function mapNodeTypeToSurveyElementType(nodeType?: string): SurveyElementType {
    switch (nodeType) {
        case 'alternativa':
            return SurveyElementType.OPTION;
        case 'input':
            return SurveyElementType.INPUT;
        case 'fim':
            return SurveyElementType.MESSAGE;
        case 'mensagem':
        default:
            return SurveyElementType.MESSAGE;
    }
}

function resolveInitialType(nodeType?: string, optionsLength = 0) {
    if (optionsLength > 0) {
        return optionsLength > 1 ? SurveyElementType.MULTIPLE_CHOICE : SurveyElementType.OPTION;
    }
    return mapNodeTypeToSurveyElementType(nodeType);
}

function CreateEditSurveyElement({
    open,
    onClose,
    data,
    id,
    onConfirm,
    initialData
}: {
    open: boolean,
    onClose: VoidFunction,
    data: SurveyElementDto | SurveysElementsCreateDto,
    id?: number,
    onConfirm?: (data: { titulo: string; tipo: string; alternativas: string[] }) => void
    initialData?: NewSurveyElementProp['initialData']
}) {
    const [form, setForm] = React.useState<SurveysElementsCreateDto>(() => {
        // Se tem initialData, usa ele, senão usa data, senão usa DEFAULT_DATA
        if (initialData) {
            const sanitizedOptions = (initialData.options || [])
                .map((option) => option?.trim())
                .filter((option): option is string => !!option && option.length > 0);
            const resolvedType = resolveInitialType(initialData.type, sanitizedOptions.length);
            const options =
                resolvedType === SurveyElementType.MULTIPLE_CHOICE || resolvedType === SurveyElementType.OPTION
                    ? (sanitizedOptions.length > 0
                        ? sanitizedOptions.map((description) => ({ description }))
                        : [...DEFAULT_DATA.options])
                    : [];
            return {
                description: initialData.label || '',
                type: resolvedType,
                options
            };
        }
        return data && Object.keys(data).length > 0 ? { ...data } : { ...DEFAULT_DATA };
    });

    // Usa um payload vazio inicialmente, pois vamos passar o form atual na chamada
    const { mutate: createSurveyElement, data: createSurveyElementResponse, isPending: isCreating } = useSurveysElementsCreateMutation({ description: '', type: SurveyElementType.MESSAGE, options: [] });
    const { mutate: updateSurveyElement, data: updateSurveyElementResponse } = useSurveysElementsUpdateMutation(id || 0, form);

    // Só reseta o form quando o modal abre (open muda de false para true)
    const prevOpenRef = React.useRef(open);
    React.useEffect(() => {
        // Se o modal acabou de abrir (mudou de fechado para aberto)
        if (open && !prevOpenRef.current) {
            if (initialData) {
                const sanitizedOptions = (initialData.options || [])
                    .map((option) => option?.trim())
                    .filter((option): option is string => !!option && option.length > 0);

                const resolvedType = resolveInitialType(initialData.type, sanitizedOptions.length);
                const options =
                    resolvedType === SurveyElementType.MULTIPLE_CHOICE || resolvedType === SurveyElementType.OPTION
                        ? (sanitizedOptions.length > 0
                            ? sanitizedOptions.map((description) => ({ description }))
                            : [...DEFAULT_DATA.options])
                        : [];

                setForm({
                    description: initialData.label || '',
                    type: resolvedType,
                    options
                });
            } else if (!id) {
                // Só reseta para DEFAULT_DATA se for um novo elemento
                setForm({ ...DEFAULT_DATA });
            }
        }
        prevOpenRef.current = open;
    }, [open, initialData, id]);

    React.useEffect(() => {
        if (createSurveyElementResponse) {
            console.log('Elemento criado com sucesso:', createSurveyElementResponse);
            // Invalida todas as queries de SURVEYS_ELEMENTS para garantir que a sidebar seja atualizada
            queryClient.invalidateQueries({ 
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
                refetchType: 'all'
            });
            // Força refetch imediato
            queryClient.refetchQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            });
            onClose();
        }
        if (updateSurveyElementResponse) {
            console.log('Elemento atualizado com sucesso:', updateSurveyElementResponse);
            // Invalida todas as queries de SURVEYS_ELEMENTS para garantir que a sidebar seja atualizada
            queryClient.invalidateQueries({ 
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
                refetchType: 'all'
            });
            onClose();
        }
    }, [createSurveyElementResponse, updateSurveyElementResponse, onClose]);

    const handleConfirm = () => {
        // Valida se tem pelo menos description preenchida
        if (!form.description || form.description.trim() === '') {
            toast.error('Por favor, preencha o título da mensagem.');
            return;
        }

        // Se é um novo elemento (sem id), SEMPRE salva no backend primeiro
        if (!id) {
            // Filtra opções válidas antes de enviar
            const payloadToSend: SurveysElementsCreateDto = {
                description: form.description.trim(),
                type: form.type,
                options: form.options
                    .filter((option) => !option.deletedAt && option.description.trim() !== '')
                    .map((option) => ({ description: option.description.trim() }))
            };
            
            console.log('Criando elemento no backend com payload:', payloadToSend);
            // Salva no backend - a mutation vai invalidar as queries e atualizar a sidebar
            createSurveyElement(payloadToSend);
            return;
        }

        // Se tem id, é edição
        if (id) {
            // Se tem onConfirm (editando nó do canvas), chama ele também
            if (onConfirm) {
                const alternativas = form.options
                    .filter((option) => !option.deletedAt && option.description.trim() !== '')
                    .map((option) => option.description);

                onConfirm({
                    titulo: form.description,
                    tipo: SurveyElementEnum[form.type],
                    alternativas
                });
            }
            // Sempre atualiza no backend também
            updateSurveyElement();
        }
    };

    const handleClose = () => {
        setForm({ ...DEFAULT_DATA });
        onClose();
    };

    const handleTipoClick = (tipo: SurveyElementType) => {
        if (id) {
            toast.warning('Não é possível alterar o tipo de um elemento existente.');
            return;
        }
        if (tipo === SurveyElementType.MULTIPLE_CHOICE || tipo === SurveyElementType.OPTION) {
            setForm((prev) => ({
                ...prev,
                type: tipo,
                options: DEFAULT_DATA.options,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                type: tipo,
                options: [],
            }));
        }
    };

    const handleAddAlternativa = (index: number) => {
        setForm((prev) => ({
            ...prev,
            options: [...prev.options, { description: '' }],
        }));
    };

    const handleRemoveSavedOption = (index: number) => {
        const options = [...form.options];
        options[index] = { ...options[index], deletedAt: new Date() };

        setForm((prev) => ({
            ...prev,
            options: options,
        }));
    }

    const handleAddSavedOption = (index: number) => {
        const options = [...form.options];
        options[index] = { ...options[index], deletedAt: null };

        setForm((prev) => ({
            ...prev,
            options: options,
        }));
    }

    const handleRemoveAlternativa = (index: number) => {
        if (form.options.length <= 2) return;
        setForm((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleAlternativaChange = (index: number, value: string) => {
        const novasAlternativas = [...form.options];
        novasAlternativas[index] = { ...novasAlternativas[index], description: value };
        setForm((prev) => ({
            ...prev,
            options: [...novasAlternativas],
        }));
    };

    const onDescriptionChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const ActionButton = ({ option, index }: { option: SurveyElementOption; index: number }) => {

        if (!!option.id && !option.deletedAt) {
            return (
                <div className={'delete-option'} aria-label={!!option.id ? 'delete-option' : ''}>
                    <IconButton
                        onClick={() => handleRemoveSavedOption(index)}
                        disabled={false}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            )
        }

        if (!!option.id && !!option.deletedAt) {
            return (
                <div className={'delete-option'} aria-label={!!option.id ? 'add-option' : ''}>
                    <IconButton
                        onClick={() => handleAddSavedOption(index)}
                        disabled={false}
                    >
                        <AddIcon />
                    </IconButton>
                </div>
            )
        }

        if (!option.id) {
            return (
                <div className={'delete-option'}>
                    <IconButton
                        onClick={() => handleRemoveAlternativa(index)}
                        disabled={false}
                    >
                        <RemoveIcon />
                    </IconButton>
                </div>
            )
        }

        return <></>
    }

    return (
        <Modal className="modal-survey-element" open={open} onClose={handleClose} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <Card style={{ width: '40%', borderRadius: '16px', padding: '24px 16px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-orange-500">
                        {id ? 'Editar Mensagem' : 'Nova Mensagem'}
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
                        value={form.description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
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
                                    clickable={!false}
                                    style={{
                                        backgroundColor: form.type === (type as unknown as SurveyElementType) ? '#f97316' : '#e5e7eb',
                                        color: form.type === (type as unknown as SurveyElementType) ? 'white' : '#374151',
                                        opacity: false ? 0.5 : 1,
                                        cursor: false ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => handleTipoClick(type)}
                                />
                            ))}
                        </div>
                    </div>

                    {(form.type === SurveyElementType.MULTIPLE_CHOICE ||
                        form.type === SurveyElementType.OPTION) && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-orange-500">
                                    Alternativas
                                </label>
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto" aria-label='options-list'>
                                    {form.options.map((alternativa, index) => (
                                        <div key={index} className="flex gap-2 items-center" aria-label={
                                            !!alternativa.id && !!alternativa.deletedAt ? 'crossed-option' : ''}
                                        >
                                            <Input
                                                placeholder="Digite uma alternativa aqui"
                                                value={alternativa.description}
                                                onChange={(e) => handleAlternativaChange(index, e.target.value)}
                                                disabled={false}
                                            />
                                            <ActionButton option={alternativa} index={index} />
                                        </div>
                                    ))}
                                    {form.options[form.options.length - 1].description.trim() !== '' && <IconButton
                                        onClick={() => handleAddAlternativa(form.options.length)}
                                        disabled={false}
                                    >
                                        <AddIcon />
                                    </IconButton>}
                                </div>
                            </div>
                        )}
                </CardContent>

                <CardActions>
                    <Button onClick={onClose}><span>Cancelar</span></Button>
                    <Button onClick={handleConfirm}><span>{!!id ? 'Salvar' : 'Criar'}</span></Button>
                </CardActions>
            </Card>
        </Modal>
    );

}

export function SurveysElementModal({
    open,
    onClose,
    id,
    onConfirm,
    initialData
}: NewSurveyElementProp) {
    const { data: surveyElementData, isLoading: surveyElementLoading } = useGetSurveysElementById(id);

    if (!onConfirm && (surveyElementLoading || (id && !surveyElementData))) {
        return (
            <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
                <Loading />
            </Modal>
        )
    }

    return (
        <CreateEditSurveyElement
            open={open}
            onClose={onClose}
            id={id}
            data={!!id ? (surveyElementData || DEFAULT_DATA) : DEFAULT_DATA}
            onConfirm={onConfirm}
            initialData={initialData}
        />
    );
}