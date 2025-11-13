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
import { useState, useMemo } from 'react';
import { useGetAllUsers, UserSearchParams } from '@/services/core/users/queries';
import {
  useCreateUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
} from '@/services/core/users/mutations';
import { UserRole } from '@/dtos/UserDto';
import styles from './page.module.css';
import { Loader } from '@/components/Loader';

// Função para formatar data
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

// Função para aplicar máscara de telefone
const applyPhoneMask = (phone?: string): string => {
  if (!phone) return '-';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  return phone;
};

export default function MembrosContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Preparar parâmetros de busca
  const searchParams: UserSearchParams = useMemo(() => {
    const params: UserSearchParams = {};
    
    if (searchTerm) {
      // Busca por nome ou email
      if (searchTerm.includes('@')) {
        params.email = searchTerm;
      } else {
        params.friendlyName = searchTerm;
      }
    }
    
    if (roleFilter !== 'all') {
      params.role = roleFilter === 'admin' ? 'ADMIN' : 'MEMBER';
    }
    
    return params;
  }, [searchTerm, roleFilter]);

  const { data: users = [], isLoading } = useGetAllUsers(searchParams);
  const createUserMutation = useCreateUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddMember = (membroData: {
    nome: string;
    email: string;
    telefone: string;
    role: UserRole;
  }) => {
    createUserMutation.mutate(
      {
        email: membroData.email,
        friendlyName: membroData.nome,
        phone: membroData.telefone,
        role: membroData.role === UserRole.ADMIN ? 'ADMIN' : 'MEMBER',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  const handleBlock = (userId: string, isBlocked: boolean) => {
    if (isBlocked) {
      unblockUserMutation.mutate(userId);
    } else {
      if (window.confirm('Tem certeza que deseja bloquear este membro?')) {
        blockUserMutation.mutate(userId);
      }
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o membro "${userName}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

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
              <SelectItem value="member" className={styles.membrosFilterItem}>Usuário</SelectItem>
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
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Nenhum membro encontrado
            </div>
          ) : (
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
                {users.map((membro) => {
                  const isBlocked = !!membro.blockedAt;
                  return (
                    <tr key={membro.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>{membro.friendlyName}</td>
                      <td className={styles.tableCell}>{membro.email}</td>
                      <td className={styles.tableCell}>{applyPhoneMask(membro.phone)}</td>
                      <td className={styles.tableCell}>{isBlocked ? formatDate(membro.blockedAt) : '-'}</td>
                      <td className={styles.tableCell}>{formatDate(membro.createdAt)}</td>
                      <td className={styles.tableCell}>-</td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtonSpacer}>
                          <Button
                            variant="outline"
                            className={styles.button}
                            onClick={() => handleBlock(membro.id, isBlocked)}
                            title={isBlocked ? 'Desbloquear' : 'Bloquear'}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            className={styles.button}
                            onClick={() => handleDelete(membro.id, membro.friendlyName)}
                            title="Deletar"
                          >
                            <UserPen className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
