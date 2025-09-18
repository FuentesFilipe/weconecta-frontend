'use client';

import React from 'react';

interface TopbarProps {
  title: string;
  onBack?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  isDisabled?: boolean;
}

export default function Topbar({ title, onBack, onSave, isSaving = false, isDisabled = false }: TopbarProps) {
  return (
    <div className="py-4 border-b border-gray-200 w-full px-4 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-3">
          {/* Botão Voltar */}
          {onBack && (
            <button
              onClick={onBack}
              disabled={isDisabled}
              className={`action-button w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                isDisabled
                  ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                  : 'bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
              }`}
              title={isDisabled ? "Desabilitado" : "Voltar"}
            >
              <svg
                className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-orange-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Botão Salvar */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isDisabled}
              className={`action-button w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                isDisabled
                  ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                  : 'bg-white border border-orange-300 hover:bg-orange-50 hover:border-orange-400 cursor-pointer'
              }`}
              title={isDisabled ? (isSaving ? "Salvando..." : "Desabilitado") : "Salvar"}
            >
              {isSaving ? (
                <svg className="w-5 h-5 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-orange-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

