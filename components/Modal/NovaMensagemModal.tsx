'use client';

import * as React from 'react';
import { Modal, CardContent, CardActions, Card, Chip } from '@mui/material'
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconButton } from '@/components/IconButton';

type NovaMensagemModalProps = {
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

enum TipoMensagem {
    Feedback = 'Feedback',
    MultiplaEscolha = 'MultiplaEscolha',
    Alternativa = 'Alternativa',
    Input = 'Input'
}

export function NovaMensagemModal({
    open,
    onClose,
    isEdit,
    onConfirm,
    initialData,
}: NovaMensagemModalProps) {
    const [titulo, setTitulo] = React.useState('');
    const [tipoSelecionado, setTipoSelecionado] = React.useState('');
    const [alternativas, setAlternativas] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (open && initialData) {
            setTitulo(initialData.label);
            
            let modalTipo = '';
            if (initialData.type === 'mensagem') {
                modalTipo = 'Feedback';
            } else if (initialData.type === 'input') {
                modalTipo = 'Input';
            } else if (initialData.type === 'alternativa') {
                modalTipo = 'Alternativa';
            }
            
            setTipoSelecionado(modalTipo);
            
            if (modalTipo === 'MultiplaEscolha' || modalTipo === 'Alternativa') {
                setAlternativas(['', '']);
            } else {
                setAlternativas([]);
            }
        } else if (open && !initialData) {
            setTitulo('');
            setTipoSelecionado('');
            setAlternativas([]);
        }
    }, [open, initialData]);

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm({
                titulo,
                tipo: tipoSelecionado,
                alternativas: alternativas.filter(alt => alt.trim() !== '')
            });
        }
        setTitulo('');
        setTipoSelecionado('');
        setAlternativas([]);
        onClose();
    };

    const handleTipoClick = (tipo: string) => {
        console.log(tipo);
        setTipoSelecionado(tipo);

        if (tipo === 'MultiplaEscolha' || tipo === 'Alternativa') {
            setAlternativas(['', '']);
        } else {
            setAlternativas([]);
        }
    };

    const handleAddAlternativa = (index: number) => {
        setAlternativas([...alternativas, '']);
    };

    const handleRemoveAlternativa = (index: number) => {
        if (alternativas.length > 2) {
            setAlternativas(alternativas.filter((_, i) => i !== index));
        }
    };

    const handleAlternativaChange = (index: number, value: string) => {
        const novasAlternativas = [...alternativas];
        novasAlternativas[index] = value;
        setAlternativas(novasAlternativas);
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
            <Card style={{ width: '40%', borderRadius: '16px', padding: '24px 16px' }}>
                <h4 className="text-lg font-semibold text-orange-500">{isEdit ? 'Editar Mensagem' : 'Nova Mensagem'}</h4>

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
                        <div className="flex gap-2">
                            {Object.values(TipoMensagem).map((tipo: string) => (
                                    <Chip
                                    key={tipo}
                                    label={tipo}
                                    clickable
                                    style={{
                                        backgroundColor: tipoSelecionado === tipo ? 'var(--primary-color)' : 'lightgray',
                                        opacity: tipoSelecionado === tipo ? 1 : 0.5
                                    }}
                                    onClick={() => handleTipoClick(tipo)}
                                />
                            ))}
                        </div>
                    </div>

                    <label className="text-sm font-medium text-orange-500">
                        Alternativas
                    </label>
                    {(tipoSelecionado === 'MultiplaEscolha' || tipoSelecionado === 'Alternativa') && (
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                            <div className="flex flex-col gap-2">

                                <div className="flex flex-col gap-2">
                                    {alternativas.map((alternativa, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                placeholder="Digite uma alternativa aqui"
                                                value={alternativa}
                                                onChange={(e) => handleAlternativaChange(index, e.target.value)}
                                            />
                                            {alternativas.length - 1 == index && (
                                                <IconButton onClick={() => handleAddAlternativa(index)}>
                                                    <span>+</span>
                                                </IconButton>
                                            )}
                                            {alternativas.length > 2 && (
                                                <IconButton onClick={() => handleRemoveAlternativa(index)}>
                                                    <span>-</span>
                                                </IconButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
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