'use client';

import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { Handle, Position } from '@xyflow/react';
import { SquarePen, Trash2 } from 'lucide-react';
import { memo } from 'react';
import './CustomNode.css';

export type CustomNodeProps = {
    id: string;
    data: {
        label: string;
        type: 'mensagem' | 'alternativa' | 'input' | 'fim';
        maxEdges?: number;
        onClick?: () => void;
        onDoubleClick?: () => void;
        onEdit?: (el: SurveyElementDto) => void;
        onDelete?: () => void;
        surveyElement?: SurveyElementDto;
    };
};

const CustomNode = memo(({ id, data }: CustomNodeProps) => {
    const {
        label,
        type,
        maxEdges = 2,
        onClick,
        onDoubleClick,
        onDelete,
        onEdit,
        surveyElement,
    } = data;

    const getNodeColor = () => {
        switch (type) {
            case 'mensagem':
                return '#F97316'; // Laranja
            case 'alternativa':
                return '#3B82F6'; // Azul
            case 'input':
                return '#6B7280'; // Cinza
            case 'fim':
                return '#EF4444'; // Vermelho
            default:
                return '#6B7280';
        }
    };

    const getNodeTypeLabel = () => {
        switch (type) {
            case 'mensagem':
                return 'Mensagem';
            case 'alternativa':
                return 'Alternativa';
            case 'input':
                return 'Input';
            case 'fim':
                return 'Fim';
            default:
                return 'Nó';
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.detail === 1) {
            onClick?.();
        } else if (e.detail === 2) {
            onDoubleClick?.();
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        console.log('🗑️ Botão de deletar clicado!', {
            id,
            onDelete: !!onDelete,
        });
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (onDelete) {
            console.log('✅ Chamando função onDelete...');
            onDelete();
        } else {
            console.error('❌ Função onDelete não encontrada!');
        }
    };

    return (
        <div
            className='custom-node'
            style={{ backgroundColor: getNodeColor() }}
            onClick={handleClick}
        >
            {/* Handle de entrada (topo) */}
            <Handle
                type='target'
                position={Position.Top}
                id='top'
                style={{ background: '#555' }}
            />

            {/* Conteúdo do nó */}
            <div className='node-content'>
                <div className='node-type-label'>{getNodeTypeLabel()}</div>
                <div className='node-main-label'>{label}</div>
                <div className='node-edges-info'>
                    {maxEdges > 0 && `${maxEdges} conexões`}
                </div>
            </div>

            {/* Ícone de lixeira */}
            <button
                className='delete-button'
                onClick={handleDeleteClick}
                title='Deletar nó'
            >
                <Trash2 size={12} />
            </button>

            {/* Ícone de editar */}
            <button
                className='edit-button'
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    console.log('✏️ Botão de editar clicado!', {
                        id,
                        surveyElement,
                        onEdit: !!onEdit,
                        onDoubleClick: !!onDoubleClick,
                    });
                    
                    // Sempre tenta chamar onEdit se disponível
                    if (onEdit) {
                        if (surveyElement && surveyElement.id) {
                            console.log('✅ Chamando onEdit com surveyElement completo:', surveyElement);
                            onEdit(surveyElement);
                        } else {
                            // Tenta extrair o ID do nodeId para criar um elemento básico
                            // O nodeId pode ter formato: element-{id}-{timestamp} ou option-{elementId}-{optionId}-{timestamp}
                            const elementIdMatch = id.match(/element-(\d+)/);
                            const extractedId = elementIdMatch ? parseInt(elementIdMatch[1], 10) : null;
                            
                            if (extractedId) {
                                console.log('✅ Extraindo ID do nodeId e criando elemento básico:', extractedId);
                                const basicElement: SurveyElementDto = {
                                    id: extractedId,
                                    description: label,
                                    type: type === 'mensagem' ? 'MESSAGE' : type === 'alternativa' ? 'OPTION' : 'INPUT',
                                    options: [],
                                    deletedAt: null,
                                };
                                onEdit(basicElement);
                            } else {
                                // Se não conseguiu extrair ID, tenta chamar onEdit sem parâmetro
                                // O ensureNodeFunctions vai usar o elemento do nó automaticamente
                                console.log('⚠️ Tentando chamar onEdit sem parâmetro (vai usar elemento do nó)');
                                onEdit();
                            }
                        }
                    } else {
                        console.log('⚠️ onEdit não disponível, usando onDoubleClick');
                        onDoubleClick?.();
                    }
                }}
                title='Editar nó'
            >
                <SquarePen size={12} />
            </button>

            {/* Handles de saída (lados e baixo) */}
            {maxEdges >= 1 && (
                <Handle
                    type='source'
                    position={Position.Bottom}
                    id='bottom'
                    style={{ background: '#555' }}
                />
            )}

            {maxEdges >= 2 && (
                <Handle
                    type='source'
                    position={Position.Right}
                    id='right'
                    style={{ background: '#555' }}
                />
            )}

            {maxEdges >= 3 && (
                <Handle
                    type='source'
                    position={Position.Left}
                    id='left'
                    style={{ background: '#555' }}
                />
            )}
        </div>
    );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
