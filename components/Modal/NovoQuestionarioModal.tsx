'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { TextArea } from '@/components/TextArea';
import { Loading } from '@/components/ui/loading';
import { Card, CardActions, CardContent, Modal } from '@mui/material';
import * as React from 'react';
import { toast } from 'react-toastify';
import { Questionario } from '@/hooks/useQuestionarios';

type NovoQuestionarioModalProps = {
    open: boolean
    onClose: VoidFunction
    isLoading?: boolean
    onSuccess?: (data: { title: string; description: string }) => void
    onError?: (error : string) => void
    questionario?: Questionario | null
    isEdit?: boolean
}

export function NovoQuestionarioModal({
    open,
    onClose,
    isLoading = false,
    onSuccess,
    onError,
    questionario,
    isEdit = false
  
}: NovoQuestionarioModalProps) {
    const [titulo, setTitulo] = React.useState('');
    const [descricao, setDescricao] = React.useState('');

    // Preencher campos quando estiver editando
    React.useEffect(() => {
        if (isEdit && questionario) {
            setTitulo(questionario.title);
            setDescricao(questionario.description);
        } else {
            setTitulo('');
            setDescricao('');
        }
    }, [isEdit, questionario]);

    const showErrorAndReturn = (message:string) => {
        toast.error(message);
        if (onError){
            onError(message);
        }
        return false;
    };


    const handleConfirm = async () => {
        if (!titulo.trim()) {
            showErrorAndReturn('Título é obrigatório');
            return;
        }
        
        try {
            // Chamar onSuccess com os dados do formulário
            onSuccess?.({ title: titulo, description: descricao });
            
            setTitulo('');
            setDescricao('');
            onClose();
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            showErrorAndReturn(errorMessage);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        
        setTitulo('');
        setDescricao('');
        onClose();
    };

    if (isLoading) {
        return (
            <Modal 
                open={open} 
                onClose={() => {}} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            >
                <Card style={{ width: '35%', borderRadius: '16px', padding: '24px 16px', minHeight: '400px' }}>
                    <Loading />
                </Card>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', }}>
            <Card style={{ width: '35%', borderRadius: '16px', padding: '24px 16px' }}>
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? 'Editar Questionário' : 'Novo Questionário'}
                    </h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        disabled={isLoading}
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
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                disabled = {isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-orange-600">
                                Membros
                            </label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 bg-white">
                                    disabled = {isLoading}
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
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                disabled = {isLoading}
                            />
                        </div>
                    </div>

                </CardContent>
                <CardActions className="justify-end gap-3 p-6 pt-0">
                    <Button
                        onClick={handleClose}
                        disabled = {isLoading}

                        
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
