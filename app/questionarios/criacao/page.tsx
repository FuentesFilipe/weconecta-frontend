'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import './index.css';

export default function CriacaoDeQuestionariosPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (isDisabled) return;
    router.push('/questionarios');
  };

  const handleSave = async () => {
    if (isDisabled || isSaving) return;

    setIsSaving(true);
    setIsDisabled(true);

    try {
      console.log('Salvando questionário...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Questionário salvo com sucesso

      console.log('Questionário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
    } finally {
      setIsSaving(false);
      setIsDisabled(false);
    }
  };

  return (
    <div className="w-full flex flex-col criacao-page">
      <Topbar 
        title="Novo Questionário"
        showBack={true}
        onBackClick={handleBack}
        onSaveClick={handleSave}
        isSaving={isSaving}
        isDisabled={isDisabled}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 bg-gray-100 p-6">
        <div className="h-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-4xl min-h-96 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Em breve: formulário para criar questionários.</p>
          </div>
        </div>
      </div>
    </div>
  );
}