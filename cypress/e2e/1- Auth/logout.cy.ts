const USERS = [
  {
    role: 'admin',
    email: 'teste_admin@email.com',
    password: '123456789',
  },
  {
    role: 'colaborador',
    email: 'teste_collab@email.com',
    password: '123456789',
  },
];

describe('Fluxo de logout', () => {
  beforeEach(() => {
    // Limpa o localStorage e sessionStorage antes de cada teste
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  USERS.forEach((user) => {
    it(`deve fazer logout com sucesso como ${user.role}`, () => {
      // Intercepta as requisições de login e logout
      cy.intercept('POST', '**/api/auth/login').as('loginRequest');
      cy.intercept('POST', '**/api/auth/logout').as('logoutRequest');

      // Primeiro faz login
      cy.visit('/login');

      // Verifica se a página carregou
      cy.contains('Log in', { timeout: 10000 }).should('be.visible');

      // Preenche os campos de login
      cy.get('input[type="email"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(user.email);

      cy.get('input[type="password"]')
        .should('be.visible')
        .clear()
        .type(user.password);

      // Marca o checkbox "Lembre-se de mim"
      cy.get('input[type="checkbox"]#rememberMe')
        .should('be.visible')
        .check();

      // Clica no botão de login
      cy.contains('button', 'Log In')
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Aguarda a requisição de login ser completada
      cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.response?.body).to.have.property('accessToken');
      });

      // Aguarda o redirecionamento após login
      cy.url({ timeout: 15000 }).should('not.include', '/login');

      // Verifica se o token foi salvo
      cy.window().should((win) => {
        const localStorageToken = win.localStorage.getItem('auth_token');
        const sessionStorageToken = win.sessionStorage.getItem('auth_token');
        const token = localStorageToken || sessionStorageToken;

        expect(token, 'Token deve existir após login').to.exist;
        expect(token, 'Token não deve estar vazio').to.not.be.empty;
      });

      // Comportamento diferente baseado no role
      if (user.role === 'colaborador') {
        // Para colaborador: após login, é redirecionado para '/' que requer ADMIN
        // então deve ver a mensagem de "Acesso negado"
        // Aguarda o React processar o token e definir o user
        cy.wait(3000);

        // Verifica que está na página correta (não está mais em /login)
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        cy.url({ timeout: 15000 }).should('include', '/');

        // Aguarda a página de acesso negado aparecer
        // O colaborador não tem permissão para acessar '/' que requer ADMIN
        // Verifica primeiro se o botão existe (mais específico que o texto)
        cy.get('#back-to-login-btn', { timeout: 20000 })
          .should('exist');

        // Depois verifica se está visível
        cy.get('#back-to-login-btn', { timeout: 20000 })
          .should('be.visible');

        // Verifica a mensagem de acesso negado (pode estar dentro do mesmo container)
        cy.get('body', { timeout: 20000 })
          .should('contain', 'Acesso negado');

        cy.get('body', { timeout: 20000 })
          .should('contain', 'Você não tem permissão para acessar essa página.');

        // Clica no botão "Voltar para Login"
        cy.get('#back-to-login-btn', { timeout: 20000 })
          .click();
      } else {
        // Para admin: usa o botão de logout da sidebar
        // Aguarda a página carregar completamente após login
        cy.wait(1000);

        // Verifica se o sidebar está visível (indicando que está logado)
        cy.get('.sidebarWrapper', { timeout: 10000 }).should('be.visible');

        // Encontra e clica no botão de logout usando o ID
        // Usa { force: true } pois o elemento pode estar coberto por outro elemento
        cy.get('#logout-btn', { timeout: 10000 })
          .should('exist')
          .click({ force: true });
      }

      // Aguarda a requisição de logout ser completada
      // Verifica se a requisição foi bem-sucedida (200) ou se retornou 401/404 (aceitável)
      cy.wait('@logoutRequest', { timeout: 10000 }).then((interception) => {
        const statusCode = interception.response?.statusCode;
        // Aceita 200 (sucesso), 401 (token inválido) ou 404 (rota não encontrada)
        // Todos são aceitáveis pois o logout local sempre funciona
        expect([200, 401, 404]).to.include(statusCode);
      });

      // Aguarda o redirecionamento para a página de login
      cy.url({ timeout: 10000 }).should('include', '/login');

      // Verifica se o token foi removido do localStorage e sessionStorage
      cy.window().should((win) => {
        const localStorageToken = win.localStorage.getItem('auth_token');
        const sessionStorageToken = win.sessionStorage.getItem('auth_token');

        expect(localStorageToken, 'Token não deve existir no localStorage após logout').to.be.null;
        expect(sessionStorageToken, 'Token não deve existir no sessionStorage após logout').to.be.null;
      });

      // Verifica se a página de login está visível
      cy.contains('Log in', { timeout: 10000 }).should('be.visible');
    });
  });


  it('deve remover o token do storage ao fazer logout', () => {
    // Intercepta as requisições
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('POST', '**/api/auth/logout').as('logoutRequest');

    // Faz login primeiro
    cy.visit('/login');

    cy.contains('Log in', { timeout: 10000 }).should('be.visible');

    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(USERS[0].email);

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(USERS[0].password);

    cy.get('input[type="checkbox"]#rememberMe')
      .should('be.visible')
      .check();

    cy.contains('button', 'Log In')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 });

    cy.url({ timeout: 15000 }).should('not.include', '/login');

    // Verifica que o token existe antes do logout
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token') || win.sessionStorage.getItem('auth_token');
      expect(token).to.not.be.null;
    });

    // Aguarda a página carregar
    cy.wait(1000);

    // Faz logout usando o ID do botão
    // Usa { force: true } pois o elemento pode estar coberto por outro elemento
    cy.get('#logout-btn', { timeout: 10000 })
      .should('exist')
      .click({ force: true });

    // Aguarda o redirecionamento
    cy.url({ timeout: 10000 }).should('include', '/login');

    // Verifica que o token foi removido
    cy.window().should((win) => {
      const localStorageToken = win.localStorage.getItem('auth_token');
      const sessionStorageToken = win.sessionStorage.getItem('auth_token');

      expect(localStorageToken, 'Token deve ser removido do localStorage').to.be.null;
      expect(sessionStorageToken, 'Token deve ser removido do sessionStorage').to.be.null;
    });
  });

  it('deve fazer logout ao clicar no botão "Voltar para Login" quando não tem permissão', () => {
    // Intercepta as requisições
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('POST', '**/api/auth/logout').as('logoutRequest');

    // Faz login como colaborador (que não tem acesso a páginas de ADMIN)
    cy.visit('/login');

    cy.contains('Log in', { timeout: 10000 }).should('be.visible');

    // Login como colaborador
    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(USERS[1].email); // colaborador

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(USERS[1].password);

    cy.get('input[type="checkbox"]#rememberMe')
      .should('be.visible')
      .check();

    cy.contains('button', 'Log In')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 });

    cy.url({ timeout: 15000 }).should('not.include', '/login');

    // Verifica que o token foi salvo
    cy.window().should((win) => {
      const token = win.localStorage.getItem('auth_token') || win.sessionStorage.getItem('auth_token');
      expect(token).to.exist;
    });

    // Aguarda a página carregar completamente após login
    cy.wait(2000);

    // Tenta acessar uma página que requer ADMIN (colaborador não tem acesso)
    // Por exemplo, /metricas que requer ADMIN
    cy.visit('/metricas', { timeout: 10000 });

    // Aguarda a página renderizar completamente (pode levar tempo para React processar)
    cy.wait(2000);

    // Verifica que está na página correta
    cy.url({ timeout: 15000 }).should('include', '/metricas');

    // Aguarda a página de acesso negado aparecer
    // Verifica primeiro se o botão existe (mais específico que o texto)
    cy.get('#back-to-login-btn', { timeout: 20000 })
      .should('exist');

    // Depois verifica se está visível
    cy.get('#back-to-login-btn', { timeout: 20000 })
      .should('be.visible');

    // Verifica a mensagem de acesso negado
    cy.get('body', { timeout: 20000 })
      .should('contain', 'Acesso negado');

    cy.get('body', { timeout: 20000 })
      .should('contain', 'Você não tem permissão para acessar essa página.');

    // Verifica que o botão "Voltar para Login" contém o texto correto
    cy.get('#back-to-login-btn', { timeout: 20000 })
      .should('contain', 'Voltar para Login');

    // Clica no botão "Voltar para Login"
    cy.get('#back-to-login-btn', { timeout: 20000 })
      .click();

    // Aguarda a requisição de logout ser completada (se houver)
    cy.wait('@logoutRequest', { timeout: 10000 }).then((interception) => {
      const statusCode = interception.response?.statusCode;
      // Aceita 200 (sucesso), 401 (token inválido) ou 404 (rota não encontrada)
      expect([200, 401, 404]).to.include(statusCode);
    });

    // Aguarda o redirecionamento para a página de login
    cy.url({ timeout: 10000 }).should('include', '/login');

    // Verifica se o token foi removido do localStorage e sessionStorage
    cy.window().should((win) => {
      const localStorageToken = win.localStorage.getItem('auth_token');
      const sessionStorageToken = win.sessionStorage.getItem('auth_token');

      expect(localStorageToken, 'Token não deve existir no localStorage após logout').to.be.null;
      expect(sessionStorageToken, 'Token não deve existir no sessionStorage após logout').to.be.null;
    });

    // Verifica se a página de login está visível
    cy.contains('Log in', { timeout: 10000 }).should('be.visible');
  });
});

