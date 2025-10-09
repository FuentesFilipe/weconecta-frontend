'use client';

import React, { useState, useEffect } from 'react';
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
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);

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
  }, [isOpen]);

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

    onConfirm({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      role: selectedRole
    });

    // Limpar formulário
    setNome('');
    setEmail('');
    setTelefone('');
    setSelectedRole(UserRole.USER);
    onClose();
  };

  const handleCancel = () => {
    // Limpar formulário
    setNome('');
    setEmail('');
    setTelefone('');
    setSelectedRole(UserRole.USER);
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
                selectedRole === UserRole.USER ? styles.roleButtonSelected : ''
              }`}
              onClick={() => setSelectedRole(UserRole.USER)}
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
            <button
              className={`${styles.roleButton} ${
                selectedRole === 'OUTRO' ? styles.roleButtonSelected : ''
              }`}
              onClick={() => setSelectedRole('OUTRO' as UserRole)}
            >
              Outro
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
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Digite um titulo aqui"
              className={styles.fieldInput}
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
