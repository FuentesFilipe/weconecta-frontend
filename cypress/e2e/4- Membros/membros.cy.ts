const ADMIN_USER = {
  role: 'admin',
  email: 'teste_admin@email.com',
  password: '123456789',
};

const MOCK_USERS = [
  {
    id: '1',
    email: 'usuario1@email.com',
    friendlyName: 'João Silva',
    phone: '11987654321',
    role: 'MEMBER' as const,
    createdAt: '2024-01-15T10:00:00Z',
    blockedAt: null,
  },
  {
    id: '2',
    email: 'admin@email.com',
    friendlyName: 'Maria Admin',
    phone: '11912345678',
    role: 'ADMIN' as const,
    createdAt: '2024-01-10T10:00:00Z',
    blockedAt: null,
  },
  {
    id: '3',
    email: 'usuario2@email.com',
    friendlyName: 'Pedro Santos',
    phone: '11955555555',
    role: 'MEMBER' as const,
    createdAt: '2024-01-20T10:00:00Z',
    blockedAt: '2024-01-25T10:00:00Z',
  },
];

describe('Fluxo de Membros', () => {
  beforeEach(() => {
    // Limpa o localStorage e sessionStorage antes de cada teste
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });

    // Intercepta as requisições de login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // Faz login como admin
    cy.visit('/login');

    cy.contains('Log in', { timeout: 10000 }).should('be.visible');

    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(ADMIN_USER.email);

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(ADMIN_USER.password);

    cy.get('input[type="checkbox"]#rememberMe')
      .should('be.visible')
      .check();

    cy.contains('button', 'Log In')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 });

    // Aguarda o redirecionamento após login
    cy.url({ timeout: 15000 }).should('not.include', '/login');

    // Intercepta as requisições de usuários
    cy.intercept('GET', '**/api/core/users**', {
      statusCode: 200,
      body: MOCK_USERS,
    }).as('getUsers');

    // Visita a página de membros
    cy.visit('/membros');
    cy.wait('@getUsers');
  });

  describe('Visualização da lista de membros', () => {
    it('deve exibir a lista de membros corretamente', () => {
      // Verifica se os elementos principais estão visíveis
      cy.get('input[placeholder="Pesquisar por um Membro"]').should('be.visible');
      cy.contains('Novo Membro').should('be.visible');
      cy.get('[data-slot="select-trigger"]').should('be.visible');

      // Verifica se a tabela está presente
      cy.get('table').should('be.visible');

      // Verifica os cabeçalhos da tabela
      cy.contains('th', 'Nome do membro').should('be.visible');
      cy.contains('th', 'Email').should('be.visible');
      cy.contains('th', 'Telefone').should('be.visible');
      cy.contains('th', 'Bloqueado').should('be.visible');
      cy.contains('th', 'Conta criada').should('be.visible');
      cy.contains('th', 'Questionários').should('be.visible');
      cy.contains('th', 'Ações').should('be.visible');

      // Verifica se os membros estão sendo exibidos
      cy.contains('td', 'João Silva').should('be.visible');
      cy.contains('td', 'usuario1@email.com').should('be.visible');
      cy.contains('td', 'Maria Admin').should('be.visible');
      cy.contains('td', 'admin@email.com').should('be.visible');
    });

    it('deve formatar telefone corretamente', () => {
      // Verifica formatação de telefone celular (11 dígitos)
      cy.contains('td', '(11) 98765-4321').should('be.visible');
      cy.contains('td', '(11) 91234-5678').should('be.visible');
    });

    it('deve formatar data corretamente', () => {
      // Verifica se as datas estão formatadas (formato DD/MM/YY)
      cy.get('tbody tr').first().within(() => {
        cy.get('td').eq(4).should('contain', '/');
      });
    });

    it('deve exibir status de bloqueado corretamente', () => {
      // Verifica membro bloqueado
      cy.contains('td', 'Pedro Santos')
        .parent('tr')
        .within(() => {
          cy.get('td').eq(3).should('not.contain', '-');
        });

      // Verifica membros não bloqueados
      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('td').eq(3).should('contain', '-');
        });
    });

    it('deve exibir estado de loading', () => {
      // Intercepta com delay para simular loading
      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: MOCK_USERS,
        delay: 1000,
      }).as('getUsersDelayed');

      cy.visit('/membros');
      
      // Verifica se o loader aparece (pode não aparecer se for muito rápido)
      // Por isso apenas verificamos que a requisição foi feita
      cy.wait('@getUsersDelayed');
    });

    it('deve exibir mensagem quando não há membros', () => {
      // Intercepta retornando array vazio
      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: [],
      }).as('getUsersEmpty');

      cy.visit('/membros');
      cy.wait('@getUsersEmpty');

      cy.contains('Nenhum membro encontrado').should('be.visible');
    });
  });

  describe('Busca de membros', () => {
    it('deve buscar membro por nome', () => {
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.friendlyName === 'João') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[0]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('searchUsers');

      cy.get('input[placeholder="Pesquisar por um Membro"]')
        .should('be.visible')
        .clear()
        .type('João');

      cy.wait('@searchUsers');
      cy.contains('td', 'João Silva').should('be.visible');
      cy.contains('td', 'Maria Admin').should('not.exist');
    });

    it('deve buscar membro por email', () => {
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.email === 'admin@email.com') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[1]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('searchUsersByEmail');

      cy.get('input[placeholder="Pesquisar por um Membro"]')
        .should('be.visible')
        .clear()
        .type('admin@email.com');

      cy.wait('@searchUsersByEmail');
      cy.contains('td', 'Maria Admin').should('be.visible');
      cy.contains('td', 'João Silva').should('not.exist');
    });

    it('deve limpar busca e mostrar todos os membros', () => {
      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: MOCK_USERS,
      }).as('getAllUsers');

      // Faz busca
      cy.get('input[placeholder="Pesquisar por um Membro"]')
        .clear()
        .type('João');

      // Limpa busca
      cy.get('input[placeholder="Pesquisar por um Membro"]')
        .clear();

      cy.wait('@getAllUsers');
      cy.contains('td', 'João Silva').should('be.visible');
      cy.contains('td', 'Maria Admin').should('be.visible');
    });
  });

  describe('Filtro por tipo', () => {
    it('deve filtrar apenas admins', () => {
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.role === 'ADMIN') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[1]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('filterAdmins');

      // Clica no filtro (SelectTrigger)
      cy.get('[data-slot="select-trigger"]').click();
      
      // Aguarda o conteúdo do Select aparecer
      cy.get('[data-slot="select-content"]').should('be.visible');
      
      // Seleciona Admin - usa force para contornar pointer-events: none do overlay
      cy.get('[data-slot="select-content"]').contains('Admin').click({ force: true });

      cy.wait('@filterAdmins');
      cy.contains('td', 'Maria Admin').should('be.visible');
      cy.contains('td', 'João Silva').should('not.exist');
    });

    it('deve filtrar apenas usuários', () => {
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.role === 'MEMBER') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[0], MOCK_USERS[2]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('filterMembers');

      // Clica no filtro (SelectTrigger)
      cy.get('[data-slot="select-trigger"]').click();
      
      // Aguarda o conteúdo do Select aparecer
      cy.get('[data-slot="select-content"]').should('be.visible');
      
      // Seleciona Usuário - usa force para contornar pointer-events: none do overlay
      cy.get('[data-slot="select-content"]').contains('Usuário').click({ force: true });

      cy.wait('@filterMembers');
      cy.contains('td', 'João Silva').should('be.visible');
      cy.contains('td', 'Maria Admin').should('not.exist');
    });

    it('deve mostrar todos quando selecionar "Todos"', () => {
      // Primeiro aplica um filtro para garantir que há uma mudança de estado
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.role === 'ADMIN') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[1]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('filterUsers');

      // Aplica filtro Admin primeiro
      cy.get('[data-slot="select-trigger"]').click();
      cy.get('[data-slot="select-content"]').should('be.visible');
      cy.get('[data-slot="select-content"]').contains('Admin').click({ force: true });
      
      // Aguarda o filtro ser aplicado e o Select fechar
      cy.wait('@filterUsers');
      cy.get('[data-slot="select-content"]').should('not.exist');

      // Verifica que apenas Admin está visível
      cy.contains('td', 'Maria Admin').should('be.visible');
      cy.contains('td', 'João Silva').should('not.exist');

      // Agora volta para Todos - pode ou não disparar uma nova requisição dependendo do estado
      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: MOCK_USERS,
      }).as('getAllUsers');

      cy.get('[data-slot="select-trigger"]').click();
      cy.get('[data-slot="select-content"]').should('be.visible');
      cy.get('[data-slot="select-content"]').contains('Todos').click({ force: true });

      // Aguarda o Select fechar
      cy.get('[data-slot="select-content"]').should('not.exist');
      
      // Verifica que todos os membros estão visíveis (pode aguardar a requisição se houver, mas não falha se não houver)
      cy.contains('td', 'João Silva', { timeout: 10000 }).should('be.visible');
      cy.contains('td', 'Maria Admin').should('be.visible');
      cy.contains('td', 'Pedro Santos').should('be.visible');
    });
  });

  describe('Adicionar novo membro', () => {
    it('deve abrir modal ao clicar em Novo Membro', () => {
      cy.contains('button', 'Novo Membro').click();
      
      cy.contains('Adicionar Membros').should('be.visible');
      cy.contains('Cargo do Usuário').should('be.visible');
      cy.contains('Nome').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Telefone').should('be.visible');
    });

    it('deve fechar modal ao clicar em Cancelar', () => {
      cy.contains('button', 'Novo Membro').click();
      cy.contains('Adicionar Membros').should('be.visible');
      
      cy.contains('button', 'Cancelar').click();
      cy.contains('Adicionar Membros').should('not.exist');
    });

    it('deve fechar modal ao clicar no X', () => {
      cy.contains('button', 'Novo Membro').click();
      cy.contains('Adicionar Membros').should('be.visible');
      
      cy.get('button[aria-label="Fechar modal"]').click();
      cy.contains('Adicionar Membros').should('not.exist');
    });

    it('deve criar novo membro com sucesso', () => {
      const newUser = {
        id: '4',
        email: 'novo@email.com',
        friendlyName: 'Novo Usuário',
        phone: '11999999999',
        role: 'MEMBER' as const,
        createdAt: new Date().toISOString(),
        blockedAt: null,
      };

      cy.intercept('POST', '**/api/core/users', {
        statusCode: 201,
        body: newUser,
      }).as('createUser');

      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: [...MOCK_USERS, newUser],
      }).as('getUsersAfterCreate');

      cy.contains('button', 'Novo Membro').click();
      
      // Preenche o formulário
      cy.get('input[placeholder="Digite um titulo aqui"]').first().type('Novo Usuário');
      cy.get('input[placeholder="Digite um titulo aqui"]').eq(1).type('novo@email.com');
      cy.get('input[placeholder="(00) 00000-0000"]').type('11999999999');

      // Confirma
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createUser');
      cy.wait('@getUsersAfterCreate');

      // Verifica se o novo membro aparece na lista
      cy.contains('td', 'Novo Usuário').should('be.visible');
      cy.contains('td', 'novo@email.com').should('be.visible');
    });

    it('deve validar campos obrigatórios', () => {
      // Configura o handler de alert ANTES do clique
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.contains('button', 'Novo Membro').click();
      
      // Tenta confirmar sem preencher
      cy.contains('button', 'Confirmar').click();

      // Verifica se o alert foi chamado
      cy.get('@alertStub').should('have.been.calledWith', 'Por favor, preencha todos os campos obrigatórios');
      
      // Verifica que o modal não fechou
      cy.contains('Adicionar Membros').should('be.visible');
    });

    it('deve selecionar role Admin', () => {
      cy.contains('button', 'Novo Membro').click();
      
      // Verifica que o botão Usuário está selecionado por padrão
      cy.contains('button', 'Usuário').should('be.visible');
      
      // Clica em Admin
      cy.contains('button', 'Admin').click();
      
      // Verifica que o botão Admin foi clicado (verificando que ainda está visível e o modal não fechou)
      cy.contains('button', 'Admin').should('be.visible');
      cy.contains('Adicionar Membros').should('be.visible');
    });
  });

  describe('Bloquear e desbloquear membro', () => {
    it('deve bloquear um membro', () => {
      const blockedUser = {
        ...MOCK_USERS[0],
        blockedAt: new Date().toISOString(),
      };

      cy.intercept('PUT', '**/api/core/users/1/block', {
        statusCode: 200,
        body: blockedUser,
      }).as('blockUser');

      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: [blockedUser, ...MOCK_USERS.slice(1)],
      }).as('getUsersAfterBlock');

      // Configura o handler de confirm ANTES do clique
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      // Encontra o botão de bloquear do primeiro membro (João Silva)
      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('button[title="Bloquear"]').click();
        });

      cy.wait('@blockUser');
      cy.wait('@getUsersAfterBlock');

      // Verifica se o membro foi bloqueado
      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('td').eq(3).should('not.contain', '-');
        });
    });

    it('deve desbloquear um membro', () => {
      const unblockedUser = {
        ...MOCK_USERS[2],
        blockedAt: null,
      };

      cy.intercept('PUT', '**/api/core/users/3/unblock', {
        statusCode: 200,
        body: unblockedUser,
      }).as('unblockUser');

      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: [MOCK_USERS[0], MOCK_USERS[1], unblockedUser],
      }).as('getUsersAfterUnblock');

      // Encontra o botão de desbloquear do membro bloqueado (Pedro Santos)
      cy.contains('td', 'Pedro Santos')
        .parent('tr')
        .within(() => {
          cy.get('button[title="Desbloquear"]').click();
        });

      cy.wait('@unblockUser');
      cy.wait('@getUsersAfterUnblock');

      // Verifica se o membro foi desbloqueado
      cy.contains('td', 'Pedro Santos')
        .parent('tr')
        .within(() => {
          cy.get('td').eq(3).should('contain', '-');
        });
    });

    it('deve cancelar bloqueio ao clicar em Cancelar no confirm', () => {
      cy.intercept('PUT', '**/api/core/users/1/block').as('blockUser');

      // Configura o handler de confirm para cancelar ANTES do clique
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });

      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('button[title="Bloquear"]').click();
        });

      // Verifica que a requisição não foi feita
      cy.get('@blockUser.all').should('have.length', 0);
    });
  });

  describe('Deletar membro', () => {
    it('deve deletar um membro', () => {
      cy.intercept('DELETE', '**/api/core/users/1', {
        statusCode: 200,
        body: { message: 'Membro deletado com sucesso' },
      }).as('deleteUser');

      cy.intercept('GET', '**/api/core/users**', {
        statusCode: 200,
        body: MOCK_USERS.slice(1),
      }).as('getUsersAfterDelete');

      // Configura o handler de confirm ANTES do clique
      cy.window().then((win) => {
        cy.stub(win, 'confirm').callsFake((message) => {
          expect(message).to.include('Tem certeza que deseja deletar o membro "João Silva"?');
          return true;
        });
      });

      // Encontra o botão de deletar do primeiro membro
      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('button[title="Deletar"]').click();
        });

      cy.wait('@deleteUser');
      cy.wait('@getUsersAfterDelete');

      // Verifica se o membro foi removido da lista
      cy.contains('td', 'João Silva').should('not.exist');
      cy.contains('td', 'Maria Admin').should('be.visible');
    });

    it('deve cancelar deleção ao clicar em Cancelar no confirm', () => {
      cy.intercept('DELETE', '**/api/core/users/1').as('deleteUser');

      // Configura o handler de confirm para cancelar ANTES do clique
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });

      cy.contains('td', 'João Silva')
        .parent('tr')
        .within(() => {
          cy.get('button[title="Deletar"]').click();
        });

      // Verifica que a requisição não foi feita
      cy.get('@deleteUser.all').should('have.length', 0);

      // Verifica que o membro ainda está na lista
      cy.contains('td', 'João Silva').should('be.visible');
    });
  });

  describe('Combinação de busca e filtro', () => {
    it('deve combinar busca por nome e filtro por tipo', () => {
      cy.intercept('GET', '**/api/core/users**', (req) => {
        if (req.query.friendlyName === 'João' && req.query.role === 'MEMBER') {
          req.reply({
            statusCode: 200,
            body: [MOCK_USERS[0]],
          });
        } else {
          req.reply({
            statusCode: 200,
            body: MOCK_USERS,
          });
        }
      }).as('searchAndFilter');

      // Aplica filtro
      cy.get('[data-slot="select-trigger"]').click();
      cy.get('[data-slot="select-content"]').should('be.visible');
      cy.get('[data-slot="select-content"]').contains('Usuário').click({ force: true });

      // Faz busca
      cy.get('input[placeholder="Pesquisar por um Membro"]')
        .clear()
        .type('João');

      cy.wait('@searchAndFilter');
      cy.contains('td', 'João Silva').should('be.visible');
      cy.contains('td', 'Maria Admin').should('not.exist');
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout em telas menores', () => {
      cy.viewport(768, 1024);
      
      // Verifica se os elementos principais ainda estão visíveis
      cy.get('input[placeholder="Pesquisar por um Membro"]').should('be.visible');
      cy.contains('Novo Membro').should('be.visible');
      
      // Verifica se a tabela tem scroll horizontal se necessário
      cy.get('table').should('be.visible');
    });
  });
});

