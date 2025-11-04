'use client';

import { Input } from '@/components/Input';
import { Accordion } from '@/components/Accordion';
import { IconButton } from '@mui/material';
import { ArrowRight as ArrowRightIcon, Clear as ClearIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import React from 'react';
import { SurveyElementDto } from '@/dtos/SurveysElementsDto';

interface CanvasSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchTerm: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  surveysElements?: SurveyElementDto[];
  selectedNodes: string[];
  onEditSidebarElement: (element: SurveyElementDto) => void;
  onInsertOnCanva: (element: SurveyElementDto) => void;
  onClearSelection: () => void;
  onDeleteMultipleNodes: () => void;
  onNewMessage: () => void;
}

export default function CanvasSidebar({
  sidebarOpen,
  setSidebarOpen,
  searchTerm,
  onInputChange,
  surveysElements,
  selectedNodes,
  onEditSidebarElement,
  onInsertOnCanva,
  onClearSelection,
  onDeleteMultipleNodes,
  onNewMessage
}: CanvasSidebarProps) {
  return (
    <aside className={`canvas-sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="canvas-sidebar-header">
        <div className="canvas-sidebar-logo">
          <img src='/logo_padrao_horizontal.png' alt="WeConecta" />
        </div>
        <button
          className="canvas-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      <div className="canvas-sidebar-content">
        <div className="canvas-sidebar-section">
          <h3 className="canvas-sidebar-title">Mensagem</h3>
          <Input
            placeholder='Pesquisar por Elementos do Questionário'
            onChange={onInputChange}
          />
        </div>

        <div className='canvas-options-list'>
          {surveysElements?.map((element) => (
            <div
              key={element.id}
              className="canvas-option-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(element));
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div className="canvas-option-content">
                <Accordion
                  key={element.id}
                  description={element.description}
                  expandable={element.options && element.options.length > 0}
                >
                  {element.options && element.options.length > 0 ? (
                    <ul>
                      {element.options.map((option) => {
                        if (option.deletedAt) return <React.Fragment key={option.id}></React.Fragment>;
                        return <li key={option.id}>{option.description}</li>;
                      })}
                    </ul>
                  ) : (
                    <div className="canvas-option-subtitle">
                      {element.type === 'OPTION' ? 'Alternativa' :
                        element.type === 'MULTIPLE_CHOICE' ? 'Múltipla escolha' :
                          element.type === 'INPUT' ? 'Campo de entrada' :
                            element.type === 'MESSAGE' ? 'Mensagem' : 'Elemento'}
                    </div>
                  )}
                </Accordion>
              </div>
              <div className="canvas-option-actions">
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditSidebarElement(element);
                  }}
                  className="canvas-edit-button"
                  title="Editar elemento"
                >
                  <EditIcon style={{ width: '1rem', height: '1rem' }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão clicado para elemento:', element);
                    onInsertOnCanva(element);
                  }}
                  className="canvas-option-button"
                  title="Adicionar ao canvas"
                >
                  <ArrowRightIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </div>

        <div className="canvas-sidebar-footer">
          {selectedNodes.length > 0 && (
            <div className="selection-info">
              <div className="selection-header">
                <div className="selection-count">
                  {selectedNodes.length} selecionado{selectedNodes.length > 1 ? 's' : ''}
                </div>
                <IconButton
                  className="clear-selection-btn"
                  onClick={onClearSelection}
                  title="Limpar seleção"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </div>
              <IconButton
                className="delete-selected-btn"
                onClick={onDeleteMultipleNodes}
                title="Deletar selecionados (Delete/Backspace)"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </div>
          )}
          <button
            className="canvas-new-message-btn"
            onClick={onNewMessage}
          >
            Nova Mensagem
          </button>
        </div>
      </div>
    </aside>
  );
}
