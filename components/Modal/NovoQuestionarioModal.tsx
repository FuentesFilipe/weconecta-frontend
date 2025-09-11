'use client';

import * as React from 'react';
import { Modal, CardHeader, CardContent, CardActions, Card } from '@mui/material'
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { TextArea } from '@/components/TextArea';

type NovoQuestionarioModalProps = {
    open: boolean
    onClose: VoidFunction
}

export function NovoQuestionarioModal({
    open,
    onClose,
}: NovoQuestionarioModalProps) {
    const [titulo, setTitulo] = React.useState('');
    const [descricao, setDescricao] = React.useState('');

    const handleConfirm = () => {
        setTitulo('');
        setDescricao('');
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <Card>
                <CardHeader>
                    <h4>Novo Questionário</h4>
                </CardHeader>
                <CardContent className="sm:max-w-md">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-600">
                                Título
                            </label>
                            <Input
                                placeholder="Digite um título aqui"
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-600">
                                Descrição
                            </label>
                            <TextArea
                                placeholder="Digite uma descrição aqui"
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                    </div>

                </CardContent>
                <CardActions>
                    <Button
                        onClick={onClose}
                    >
                        <span>Cancelar</span>
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!titulo.trim()}
                    >
                        <span>Confirmar</span>
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
}
