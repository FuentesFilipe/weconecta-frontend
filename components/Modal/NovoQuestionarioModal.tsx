'use client';

import * as React from 'react';

import { Button, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui';


type NovoQuestionarioModalProps = {
    trigger?: React.ReactNode
    onConfirm?: (data: { titulo: string; descricao: string }) => void
    onCancel?: () => void
}

export function NovoQuestionarioModal({
    trigger,
    onConfirm,
    onCancel
}: NovoQuestionarioModalProps) {
    const [titulo, setTitulo] = React.useState('');
    const [descricao, setDescricao] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm({ titulo, descricao });
        }
        setIsOpen(false);
        setTitulo('');
        setDescricao('');
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        setIsOpen(false);
        setTitulo('');
        setDescricao('');
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Limpa os campos quando o modal é fechado (por qualquer meio)
            setTitulo('');
            setDescricao('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        Novo Questionário
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Novo Questionário
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-600">
                            Título
                        </label>
                        <Input
                            placeholder="Digite um título aqui"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-600">
                            Descrição
                        </label>
                        <Textarea
                            placeholder="Digite a descrição aqui"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!titulo.trim()}
                        className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
