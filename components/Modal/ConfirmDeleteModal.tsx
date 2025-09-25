'use client';

import * as React from 'react';
import { Modal, CardContent, CardActions, Card } from '@mui/material';
import { Button } from '@/components/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

type ConfirmDeleteModalProps = {
    open: boolean;
    onClose: VoidFunction;
    onConfirm: VoidFunction;
    title: string;
    message: string;
    itemType: 'nó' | 'conexão';
}

export function ConfirmDeleteModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    itemType
}: ConfirmDeleteModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '1rem' 
            }}
        >
            <Card style={{ 
                width: '400px', 
                borderRadius: '16px', 
                padding: '24px 16px',
                backgroundColor: '#fff'
            }}>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
                            <p className="text-sm text-gray-600">{message}</p>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                            <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
                            {itemType === 'nó' 
                                ? ' O nó e todas as suas conexões serão removidos permanentemente.'
                                : ' A conexão será removida permanentemente.'
                            }
                        </p>
                    </div>
                </CardContent>

                <CardActions className="flex justify-end gap-3">
                    <Button 
                        onClick={onClose}
                        style={{ 
                            backgroundColor: '#6B7280', 
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        style={{ 
                            backgroundColor: '#EF4444', 
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
}
