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
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
            <Card style={{ width: '35%', borderRadius: '16px', padding: '24px 16px' }}>
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Novo Questionário</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <CardContent className=" w-full ">
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
                                Membros
                            </label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 bg-white">
                                    <option value="">Selecione os membros</option>
                                    <option value="membro1">Membro 1</option>
                                    <option value="membro2">Membro 2</option>
                                    <option value="membro3">Membro 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-600">
                                Descrição
                            </label>
                            <TextArea
                                placeholder="Digite a descrição aqui"
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>
                    </div>

                </CardContent>
                <CardActions className="justify-end gap-3 p-6 pt-0">
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
