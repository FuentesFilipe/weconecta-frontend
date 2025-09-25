'use client';

import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import './CustomNode.css';

export interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    type: 'mensagem' | 'alternativa' | 'input' | 'fim';
    maxEdges?: number;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onDelete?: () => void;
  };
}

const CustomNode = memo(({ id, data }: CustomNodeProps) => {
  const { label, type, maxEdges = 2, onClick, onDoubleClick, onDelete } = data;

  const getNodeColor = () => {
    switch (type) {
      case 'mensagem':
        return '#3B82F6'; // Azul
      case 'alternativa':
        return '#F97316'; // Laranja
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
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onDelete?.();
  };

  return (
    <div
      className="custom-node"
      style={{ backgroundColor: getNodeColor() }}
      onClick={handleClick}
    >
      {/* Handle de entrada (topo) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#555' }}
      />
      
      {/* Conteúdo do nó */}
      <div className="node-content">
        <div className="node-type-label">{getNodeTypeLabel()}</div>
        <div className="node-main-label">{label}</div>
        <div className="node-edges-info">
          {maxEdges > 0 && `${maxEdges} conexões`}
        </div>
      </div>

      {/* Ícone de lixeira */}
      <button
        className="delete-button"
        onClick={handleDeleteClick}
        title="Deletar nó"
      >
        <Trash2 size={12} />
      </button>

      {/* Handles de saída (lados e baixo) */}
      {maxEdges >= 1 && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ background: '#555' }}
        />
      )}
      
      {maxEdges >= 2 && (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ background: '#555' }}
        />
      )}
      
      {maxEdges >= 3 && (
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          style={{ background: '#555' }}
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
