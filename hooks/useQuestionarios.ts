import { useState, useEffect, useCallback } from 'react';
import { surveysMock } from '@/components/SurveyCard/mockData';

export interface Questionario {
  id: number;
  title: string;
  description: string;
  surveyUrl: string;
}

const STORAGE_KEY = 'questionarios_weconnecta';

export function useQuestionarios() {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar questionários do localStorage ou usar dados mock
  const loadQuestionarios = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQuestionarios(parsed);
      } else {
        // Se não há dados salvos, usar os dados mock
        setQuestionarios(surveysMock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(surveysMock));
      }
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      setQuestionarios(surveysMock);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar questionários no localStorage
  const saveQuestionarios = useCallback((newQuestionarios: Questionario[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuestionarios));
      setQuestionarios(newQuestionarios);
    } catch (error) {
      console.error('Erro ao salvar questionários:', error);
    }
  }, []);

  // Criar novo questionário
  const createQuestionario = useCallback((data: Omit<Questionario, 'id'>) => {
    const newId = Math.max(...questionarios.map(q => q.id), 0) + 1;
    const newQuestionario: Questionario = {
      ...data,
      id: newId,
      surveyUrl: `https://example.com/survey/${newId}`,
    };
    
    const updatedQuestionarios = [...questionarios, newQuestionario];
    saveQuestionarios(updatedQuestionarios);
    return newQuestionario;
  }, [questionarios, saveQuestionarios]);

  // Editar questionário
  const updateQuestionario = useCallback((id: number, data: Partial<Omit<Questionario, 'id'>>) => {
    const updatedQuestionarios = questionarios.map(q => 
      q.id === id ? { ...q, ...data } : q
    );
    saveQuestionarios(updatedQuestionarios);
  }, [questionarios, saveQuestionarios]);

  // Deletar questionário
  const deleteQuestionario = useCallback((id: number) => {
    const updatedQuestionarios = questionarios.filter(q => q.id !== id);
    saveQuestionarios(updatedQuestionarios);
  }, [questionarios, saveQuestionarios]);

  // Duplicar questionário
  const duplicateQuestionario = useCallback((id: number) => {
    const questionario = questionarios.find(q => q.id === id);
    if (!questionario) return null;

    const newId = Math.max(...questionarios.map(q => q.id), 0) + 1;
    const duplicated: Questionario = {
      ...questionario,
      id: newId,
      title: `${questionario.title} (Cópia)`,
      surveyUrl: `https://example.com/survey/${newId}`,
    };

    const updatedQuestionarios = [...questionarios, duplicated];
    saveQuestionarios(updatedQuestionarios);
    return duplicated;
  }, [questionarios, saveQuestionarios]);

  // Copiar URL
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // toast.info('URL copiada para a área de transferência!');
      })
      .catch((err) => {
        console.error('Erro ao copiar URL:', err);
      });
  }, []);

  // Buscar questionário por ID
  const getQuestionarioById = useCallback((id: number) => {
    return questionarios.find(q => q.id === id);
  }, [questionarios]);

  useEffect(() => {
    loadQuestionarios();
  }, [loadQuestionarios]);

  return {
    questionarios,
    isLoading,
    createQuestionario,
    updateQuestionario,
    deleteQuestionario,
    duplicateQuestionario,
    copyUrl,
    getQuestionarioById,
  };
}


