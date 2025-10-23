'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus } from 'lucide-react';
import AdicionarMembroModal from '@/components/Modal/AdicionarMembroModal';
import styles from './page.module.css';

// Dados mockados para demonstração
const membrosData = [
  {
    id: 1,
    nome: 'Bruno Silva',
    email: 'brunosilva@gmail.com',
    telefone: '(57) 9.9988-2457',
    bloqueado: '20/04/23',
    contaCriada: '20/04/23',
    questionarios: 'Questionário'
  },
  {
    id: 2,
    nome: 'Carolina Moraes',
    email: 'carolinamoraes@gmail.com',
    telefone: '(57) 9.9847-5471',
    bloqueado: '20/04/23',
    contaCriada: '20/04/23',
    questionarios: 'Questionário'
  },
  {
    id: 3,
    nome: 'Bruno Silva',
    email: 'brunosilva@gmail.com',
    telefone: '(57) 9.9988-2457',
    bloqueado: '20/04/23',
    contaCriada: '20/04/23',
    questionarios: 'Questionário'
  }
];

export default function MembrosContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMember = (membroData: {
    nome: string;
    email: string;
    telefone: string;
    role: any;
  }) => {
    console.log('Novo membro:', membroData);
    // Aqui você pode adicionar a lógica para salvar o novo membro
    alert('Membro adicionado com sucesso!');
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Seção de busca e filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <label className={styles.searchLabel}>Busca</label>
          <div className={styles.searchInputContainer}>
            <Search className={styles.searchIcon} />
            <Input 
              placeholder="Procure por um membro"
              className={styles.searchInput}
            />
          </div>
        </div>
        
        <div className={styles.filterContainer}>
          <label className={styles.filterLabel}>Filtrar</label>
          <Button variant="outline" className={styles.filterButton}>
            Adicionar Filtros
            <Filter className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className={styles.newMemberButton}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Membro
        </Button>
      </div>
      
      {/* Tabela de membros */}
      <Card className={styles.membersCard}>
        <div className={styles.tableContainer}>
          <table className={styles.membersTable}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Nome do membro</th>
                <th className={styles.tableHeader}>Email</th>
                <th className={styles.tableHeader}>Telefone</th>
                <th className={styles.tableHeader}>Bloqueado</th>
                <th className={styles.tableHeader}>Conta criada</th>
                <th className={styles.tableHeader}>Questionários</th>
              </tr>
            </thead>
            <tbody>
              {membrosData.map((membro) => (
                <tr key={membro.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{membro.nome}</td>
                  <td className={styles.tableCell}>{membro.email}</td>
                  <td className={styles.tableCell}>{membro.telefone}</td>
                  <td className={styles.tableCell}>{membro.bloqueado}</td>
                  <td className={styles.tableCell}>{membro.contaCriada}</td>
                  <td className={styles.tableCell}>{membro.questionarios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Adicionar Membro */}
      <AdicionarMembroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddMember}
      />
    </div>
  );
}
