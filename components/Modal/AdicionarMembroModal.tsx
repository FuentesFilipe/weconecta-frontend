'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { UserRole } from '@/dtos/UserDto';
import styles from './AdicionarMembroModal.module.css';

interface AdicionarMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (membroData: {
    nome: string;
    email: string;
    telefone: string;
    role: UserRole;
  }) => void;
}

export default function AdicionarMembroModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: AdicionarMembroModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.MEMBER);

  // Função para aplicar máscara de telefone brasileiro
  const applyPhoneMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara: (XX) XXXXX-XXXX para celular ou (XX) XXXX-XXXX para fixo
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      // Celular: (XX) XXXXX-XXXX
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Função para remover máscara do telefone
  const removePhoneMask = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Handler para mudança do input de telefone (aplica máscara)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maskedValue = applyPhoneMask(value);
    setTelefone(maskedValue);
  };

  const handleCancel = useCallback(() => {
    // Limpar formulário
    setNome('');
    setEmail('');
    setTelefone('');
    setSelectedRole(UserRole.MEMBER);
    onClose();
  }, [onClose]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Previne scroll do body
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleCancel]);

  const handleConfirm = () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, insira um email válido');
      return;
    }

    // Remove a máscara antes de enviar
    const telefoneSemMascara = removePhoneMask(telefone.trim());

    onConfirm({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefoneSemMascara,
      role: selectedRole
    });

    // Limpar formulário
    setNome('');
    setEmail('');
    setTelefone('');
    setSelectedRole(UserRole.MEMBER);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Adicionar Membros</h2>
          <button 
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Seção de Cargo do Usuário */}
        <div className={styles.roleSection}>
          <h3 className={styles.roleTitle}>Cargo do Usuário</h3>
          <div className={styles.roleButtons}>
            <button
              className={`${styles.roleButton} ${
                selectedRole === UserRole.MEMBER ? styles.roleButtonSelected : ''
              }`}
              onClick={() => setSelectedRole(UserRole.MEMBER)}
            >
              Usuário
            </button>
            <button
              className={`${styles.roleButton} ${
                selectedRole === UserRole.ADMIN ? styles.roleButtonSelected : ''
              }`}
              onClick={() => setSelectedRole(UserRole.ADMIN)}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Campos de entrada */}
        <div className={styles.formFields}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nome</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite um titulo aqui"
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite um titulo aqui"
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Telefone</label>
            <Input
              value={telefone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className={styles.fieldInput}
              maxLength={15}
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className={styles.actionButtons}>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className={styles.confirmButton}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
