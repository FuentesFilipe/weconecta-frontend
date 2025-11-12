'use client';

import AdicionarMembroModal from '@/components/Modal/AdicionarMembroModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ban, Filter, Plus, UserPen } from 'lucide-react';
import { useState } from 'react';
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
    questionarios: 'Questionário',
    role: 'admin'
  },
  {
    id: 2,
    nome: 'Carolina Moraes',
    email: 'carolinamoraes@gmail.com',
    telefone: '(57) 9.9847-5471',
    bloqueado: '20/04/23',
    contaCriada: '20/04/23',
    questionarios: 'Questionário',
    role: 'usuario'
  },
  {
    id: 3,
    nome: 'Bruno Silva',
    email: 'brunosilva@gmail.com',
    telefone: '(57) 9.9988-2457',
    bloqueado: '20/04/23',
    contaCriada: '20/04/23',
    questionarios: 'Questionário',
    role: 'usuario'
  }
];

export default function MembrosContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  const filteredMembros = membrosData.filter(membro => {
    const matchesSearch =
      membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || membro.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className={styles.pageContainer}>

      {/* Seção de busca e filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <label className={styles.searchLabel}></label>
          <div className={styles.searchInputContainer}>
            <Input
              placeholder="Pesquisar por um Membro"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className={styles.filterContainer}>
          <label className={styles.filterLabel}></label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className={styles.filterButton}>
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent className={styles.membrosFilterDropdown}>
              <SelectItem value="all" className={styles.membrosFilterItem}>Todos</SelectItem>
              <SelectItem value="admin" className={styles.membrosFilterItem}>Admin</SelectItem>
              <SelectItem value="usuario" className={styles.membrosFilterItem}>Usuário</SelectItem>
            </SelectContent>
          </Select>
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
                <th className={styles.tableHeader}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembros.map((membro) => (
                <tr key={membro.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{membro.nome}</td>
                  <td className={styles.tableCell}>{membro.email}</td>
                  <td className={styles.tableCell}>{membro.telefone}</td>
                  <td className={styles.tableCell}>{membro.bloqueado}</td>
                  <td className={styles.tableCell}>{membro.contaCriada}</td>
                  <td className={styles.tableCell}>{membro.questionarios}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtonSpacer} >
                      <Button variant="outline" className={styles.button}>
                        <UserPen className="h-4 w-4" />
                      </Button>

                      <Button variant='destructive' className={styles.button}>
                        <Ban className="  h-4 w-4" />
                      </Button>
                    </div>
                  </td>
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
