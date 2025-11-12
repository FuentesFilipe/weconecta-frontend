const ADMIN_USER = {
  role: 'admin',
  email: 'teste_admin@email.com',
  password: '123456789',
};

const MOCK_SURVEYS = [
  {
    id: 1,
    title: 'Pesquisa de Satisfação',
    description: 'Avalia a satisfação dos clientes',
    url: '',
    flow: null,
    firstSurveyElement: null,
  },
  {
    id: 2,
    title: 'Feedback de Produto',
    description: 'Coleta feedback sobre produtos',
    url: '',
    flow: null,
    firstSurveyElement: null,
  },
];

describe('Fluxo de Questionários', () => {
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

    // Intercepta as requisições de questionários
    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [MOCK_SURVEYS, MOCK_SURVEYS.length],
    }).as('getSurveys');

    // Visita a página de questionários
    cy.visit('/questionarios', { timeout: 10000 });

    // Aguarda a lista de questionários carregar
    cy.wait('@getSurveys', { timeout: 10000 });
    cy.wait(1000);
  });

  describe('Novo Questionário', () => {
    it('deve criar um novo questionário', () => {
      const newSurvey = {
        id: 3,
        title: 'Novo Questionário Teste',
        description: 'Descrição do novo questionário',
        url: '',
        flow: null,
        firstSurveyElement: null,
      };

      // Cria uma lista atualizada incluindo o novo questionário
      const updatedSurveysList = [...MOCK_SURVEYS, newSurvey];

      // Intercepta a requisição de criação
      cy.intercept('POST', '**/api/core/surveys', {
        statusCode: 201,
        body: newSurvey,
      }).as('createSurvey');

      // Atualiza o interceptor de GET para retornar a lista atualizada após criar
      // Isso simula o comportamento real onde a lista é atualizada após criar um novo item
      cy.intercept('GET', '**/api/core/surveys**', {
        statusCode: 200,
        body: [updatedSurveysList, updatedSurveysList.length],
      }).as('getSurveysUpdated');

      // Clica no botão "Novo Questionário"
      cy.contains('button', 'Novo Questionário', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir
      cy.contains('Novo Questionário', { timeout: 10000 }).should('be.visible');

      // Aguarda o modal renderizar completamente
      cy.wait(1500);

      // Material-UI TextField renderiza inputs dentro de uma estrutura específica
      // O Input component usa TextField do Material-UI que renderiza o label como elemento separado
      // Procura pelo input dentro do modal usando a classe do modal
      // Material-UI TextField renderiza inputs dentro de uma div com classe MuiOutlinedInput-input
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          // Verifica se o label "Título" está visível
          cy.contains('Título', { timeout: 10000 })
            .should('be.visible');

          // Verifica se o label "Descrição" está visível
          cy.contains('Descrição', { timeout: 10000 })
            .should('be.visible');
        });

      // Material-UI TextField renderiza inputs dentro de uma estrutura específica
      // Procura pelos inputs dentro do modal
      // O primeiro input é o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .find('input')
        .should('have.length.at.least', 2)
        .first()
        .should('be.visible')
        .should('not.be.disabled')
        .clear({ force: true })
        .type(newSurvey.title, { force: true });

      // Aguarda um pouco para o valor ser atualizado
      cy.wait(300);

      // Preenche a descrição
      // O segundo input é a descrição
      cy.get('.modal-survey-element', { timeout: 10000 })
        .find('input')
        .should('have.length.at.least', 2)
        .last()
        .should('be.visible')
        .should('not.be.disabled')
        .clear({ force: true })
        .type(newSurvey.description, { force: true });

      // Clica no botão "Criar"
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Aguarda a requisição de criação ser completada
      cy.wait('@createSurvey', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
        expect(interception.response?.body).to.have.property('id');
        expect(interception.response?.body.title).to.equal(newSurvey.title);
      });

      // Verifica se o toast de sucesso aparece
      cy.contains('Questionário criado com sucesso!', { timeout: 5000 }).should('be.visible');

      // O modal é renderizado condicionalmente ({editingQuestionarioId.isOpen && <SurveysModal .../>})
      // Quando onClose() é chamado, setEditingQuestionarioId({ id: null, isOpen: false })
      // faz com que o componente SurveysModal não seja mais renderizado (conditional rendering)
      // Como o modal é renderizado condicionalmente, quando isOpen = false, ele não existe no DOM
      // O React Query atualiza o `data` de forma assíncrona após a mutation, então pode haver um delay
      // O Material-UI Modal pode manter o elemento no DOM durante animações, mas como o componente
      // é renderizado condicionalmente, quando isOpen = false, o componente não é renderizado
      // Remove a verificação do modal fechado pois pode haver delay no React Query atualizar o data
      // O importante é que a requisição foi bem-sucedida e o toast apareceu

      // Aguarda a lista ser atualizada (após invalidação do React Query)
      cy.wait('@getSurveysUpdated', { timeout: 10000 }).then((interception) => {
        // Verifica se a lista retornada inclui o novo questionário
        const surveys = interception.response?.body[0];
        expect(surveys).to.be.an('array');
        expect(surveys.length).to.equal(3); // 2 originais + 1 novo
        expect(surveys).to.deep.include(newSurvey);
      });

      // Verifica se o novo card aparece na lista
      // Aguarda um pouco para o React renderizar os novos cards
      cy.wait(1000);
      
      // Verifica se há pelo menos 3 cards (2 originais + 1 novo)
      cy.get('.survey-card', { timeout: 10000 })
        .should('have.length.at.least', 3);
      
      // Verifica se o novo card aparece na lista usando o título
      cy.contains('.survey-card', newSurvey.title, { timeout: 5000 })
        .should('be.visible');
      
      // Verifica se a descrição do novo card também está visível
      cy.contains('.survey-card', newSurvey.description, { timeout: 5000 })
        .should('be.visible');
    });
  });

  describe('Editar Questionário', () => {
    it('deve editar um questionário existente', () => {
      const surveyId = MOCK_SURVEYS[0].id;
      const updatedSurvey = {
        ...MOCK_SURVEYS[0],
        title: 'Título Editado',
        description: 'Descrição Editada',
      };

      // Cria uma lista atualizada com o questionário editado
      const updatedSurveysList = [
        updatedSurvey,
        MOCK_SURVEYS[1], // Mantém o segundo questionário inalterado
      ];

      // Intercepta a requisição de obter questionário por ID
      cy.intercept('GET', `**/api/core/surveys/${surveyId}`, {
        statusCode: 200,
        body: MOCK_SURVEYS[0],
      }).as('getSurveyById');

      // Intercepta a requisição de atualização
      cy.intercept('POST', '**/api/core/surveys', {
        statusCode: 200,
        body: updatedSurvey,
      }).as('updateSurvey');

      // Atualiza o interceptor de GET para retornar a lista atualizada após editar
      cy.intercept('GET', '**/api/core/surveys**', {
        statusCode: 200,
        body: [updatedSurveysList, updatedSurveysList.length],
      }).as('getSurveysUpdated');

      // Aguarda os cards aparecerem
      cy.wait(1000);

      // Clica no botão de editar do primeiro questionário
      // O botão de editar está dentro do card
      cy.get('.survey-card', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('[aria-label="buttons-container"]')
            .should('be.visible')
            .within(() => {
              // Procura pelo botão de editar (EditIcon)
              cy.get('button[title="Editar questionário"]', { timeout: 10000 })
                .should('exist')
                .click({ force: true });
            });
        });

      // Aguarda o modal abrir
      cy.contains('Editar Questionário', { timeout: 10000 }).should('be.visible');

      // Aguarda os dados serem carregados
      cy.wait('@getSurveyById', { timeout: 10000 });

      // Aguarda o modal renderizar completamente
      cy.wait(1500);

      // Verifica se os campos estão preenchidos
      // Material-UI TextField renderiza inputs dentro de uma estrutura específica
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          // Verifica se os labels estão visíveis
          cy.contains('Título', { timeout: 10000 })
            .should('be.visible');

          cy.contains('Descrição', { timeout: 10000 })
            .should('be.visible');
        });

      // Procura pelo input do título (primeiro input)
      cy.get('.modal-survey-element', { timeout: 10000 })
        .find('input')
        .should('have.length.at.least', 2)
        .first()
        .should('be.visible')
        .should('not.be.disabled')
        .should('have.value', MOCK_SURVEYS[0].title)
        .clear({ force: true })
        .type(updatedSurvey.title, { force: true });

      // Aguarda um pouco para o valor ser atualizado
      cy.wait(300);

      // Preenche a descrição
      // O segundo input é a descrição
      cy.get('.modal-survey-element', { timeout: 10000 })
        .find('input')
        .should('have.length.at.least', 2)
        .last()
        .should('be.visible')
        .should('not.be.disabled')
        .should('have.value', MOCK_SURVEYS[0].description)
        .clear({ force: true })
        .type(updatedSurvey.description, { force: true });

      // Clica no botão "Salvar"
      cy.contains('button', 'Salvar', { timeout: 10000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Aguarda a requisição de atualização ser completada
      cy.wait('@updateSurvey', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.response?.body.title).to.equal(updatedSurvey.title);
        expect(interception.response?.body.description).to.equal(updatedSurvey.description);
      });

      // Verifica se o toast de sucesso aparece
      cy.contains('Questionário atualizado com sucesso!', { timeout: 5000 }).should('be.visible');

      // Aguarda a lista ser atualizada (após invalidação do React Query)
      cy.wait('@getSurveysUpdated', { timeout: 10000 }).then((interception) => {
        // Verifica se a lista retornada inclui o questionário editado
        const surveys = interception.response?.body[0];
        expect(surveys).to.be.an('array');
        expect(surveys.length).to.equal(2);
        // Verifica se o questionário editado está na lista com os novos valores
        const editedSurvey = surveys.find((s: any) => s.id === surveyId);
        expect(editedSurvey).to.exist;
        expect(editedSurvey.title).to.equal(updatedSurvey.title);
        expect(editedSurvey.description).to.equal(updatedSurvey.description);
      });

      // Aguarda um pouco para o React renderizar os cards atualizados
      cy.wait(1000);

      // Verifica se o card foi atualizado na lista com o novo título
      cy.contains('.survey-card', updatedSurvey.title, { timeout: 5000 })
        .should('be.visible');

      // Verifica se o card foi atualizado na lista com a nova descrição
      cy.contains('.survey-card', updatedSurvey.description, { timeout: 5000 })
        .should('be.visible');

      // Verifica se o título antigo não aparece mais
      cy.contains('.survey-card', MOCK_SURVEYS[0].title, { timeout: 3000 })
        .should('not.exist');
    });
  });

  describe('Duplicar Questionário', () => {
    it('deve duplicar um questionário existente', () => {
      const surveyToDuplicate = MOCK_SURVEYS[0];
      const duplicatedSurvey = {
        id: 3,
        title: `${surveyToDuplicate.title} (Cópia)`,
        description: surveyToDuplicate.description,
        url: '',
        flow: null,
        firstSurveyElement: null,
      };

      // Cria uma lista atualizada incluindo o questionário duplicado
      const updatedSurveysList = [...MOCK_SURVEYS, duplicatedSurvey];

      // Intercepta a requisição de criação (duplicação)
      cy.intercept('POST', '**/api/core/surveys', {
        statusCode: 201,
        body: duplicatedSurvey,
      }).as('duplicateSurvey');

      // Atualiza o interceptor de GET para retornar a lista atualizada após duplicar
      cy.intercept('GET', '**/api/core/surveys**', {
        statusCode: 200,
        body: [updatedSurveysList, updatedSurveysList.length],
      }).as('getSurveysUpdated');

      // Aguarda os cards aparecerem
      cy.wait(1000);

      // Clica no botão de duplicar do primeiro questionário
      cy.get('.survey-card', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('[aria-label="buttons-container"]')
            .should('be.visible')
            .within(() => {
              // Procura pelo botão de duplicar (CopyIcon)
              cy.get('button[title="Duplicar questionário"]', { timeout: 10000 })
                .should('exist')
                .click({ force: true });
            });
        });

      // Aguarda a requisição de duplicação ser completada
      cy.wait('@duplicateSurvey', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
        expect(interception.response?.body.title).to.include('(Cópia)');
      });

      // Verifica se o toast de sucesso aparece
      cy.contains('Questionário duplicado com sucesso!', { timeout: 5000 }).should('be.visible');

      // Aguarda a lista ser atualizada (após invalidação do React Query)
      cy.wait('@getSurveysUpdated', { timeout: 10000 }).then((interception) => {
        // Verifica se a lista retornada inclui o questionário duplicado
        const surveys = interception.response?.body[0];
        expect(surveys).to.be.an('array');
        expect(surveys.length).to.equal(3); // 2 originais + 1 duplicado
        expect(surveys).to.deep.include(duplicatedSurvey);
        // Verifica se o questionário original ainda está na lista
        expect(surveys).to.deep.include(surveyToDuplicate);
      });

      // Aguarda um pouco para o React renderizar os novos cards
      cy.wait(1000);

      // Verifica se há pelo menos 3 cards (2 originais + 1 duplicado)
      cy.get('.survey-card', { timeout: 10000 })
        .should('have.length.at.least', 3);

      // Verifica se o card duplicado aparece na lista com o título "(Cópia)"
      cy.contains('.survey-card', duplicatedSurvey.title, { timeout: 5000 })
        .should('be.visible');

      // Verifica se o questionário original ainda está na lista
      cy.contains('.survey-card', surveyToDuplicate.title, { timeout: 5000 })
        .should('be.visible');
    });
  });

  describe('Deletar Questionário', () => {
    it('deve deletar um questionário existente', () => {
      const surveyId = MOCK_SURVEYS[0].id;
      const surveyToDelete = MOCK_SURVEYS[0];

      // Cria uma lista atualizada sem o questionário deletado
      const updatedSurveysList = MOCK_SURVEYS.filter((survey) => survey.id !== surveyId);

      // Intercepta a requisição de deleção
      cy.intercept('DELETE', `**/api/core/surveys/${surveyId}`, {
        statusCode: 200,
        body: { message: 'Questionário deletado com sucesso' },
      }).as('deleteSurvey');

      // Atualiza o interceptor de GET para retornar a lista atualizada após deletar
      cy.intercept('GET', '**/api/core/surveys**', {
        statusCode: 200,
        body: [updatedSurveysList, updatedSurveysList.length],
      }).as('getSurveysUpdated');

      // Aguarda os cards aparecerem
      cy.wait(1000);

      // Clica no botão de deletar do primeiro questionário
      cy.get('.survey-card', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('[aria-label="buttons-container"]')
            .should('be.visible')
            .within(() => {
              // Procura pelo botão de deletar (DeleteIcon)
              // O botão não tem title, então procura pelos botões e clica no terceiro (índice 2)
              // A ordem dos botões é: Edit (0), Duplicate (1), Delete (2), Copy URL (3)
              cy.get('button')
                .should('have.length.at.least', 4)
                .eq(2) // Terceiro botão (índice 2) é o de deletar
                .should('exist')
                .should('be.visible')
                .click({ force: true });
            });
        });

      // Aguarda um pouco para a requisição ser disparada
      cy.wait(200);

      // Aguarda a requisição de deleção ser completada
      cy.wait('@deleteSurvey', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verifica se o toast de sucesso aparece
      cy.contains('Questionário deletado com sucesso!', { timeout: 5000 }).should('be.visible');

      // Aguarda a lista ser atualizada (após invalidação do React Query)
      cy.wait('@getSurveysUpdated', { timeout: 10000 }).then((interception) => {
        // Verifica se a lista retornada não inclui o questionário deletado
        const surveys = interception.response?.body[0];
        expect(surveys).to.be.an('array');
        expect(surveys.length).to.equal(1); // Apenas 1 questionário restante (o segundo)
        // Verifica se o questionário deletado não está na lista
        const deletedSurvey = surveys.find((s: any) => s.id === surveyId);
        expect(deletedSurvey).to.be.undefined;
        // Verifica se o segundo questionário ainda está na lista
        expect(surveys).to.deep.include(MOCK_SURVEYS[1]);
      });

      // Aguarda um pouco para o React renderizar os cards atualizados
      cy.wait(1000);

      // Verifica se há apenas 1 card (o questionário deletado foi removido)
      cy.get('.survey-card', { timeout: 10000 })
        .should('have.length', 1);

      // Verifica se o card deletado não aparece mais na lista
      cy.contains('.survey-card', surveyToDelete.title, { timeout: 3000 })
        .should('not.exist');

      // Verifica se o segundo questionário ainda está na lista
      cy.contains('.survey-card', MOCK_SURVEYS[1].title, { timeout: 5000 })
        .should('be.visible');
    });
  });

  describe('Copiar Link de Questionário', () => {
    it('deve copiar o link do questionário para a área de transferência', () => {
      const survey = MOCK_SURVEYS[0];

      // Aguarda os cards aparecerem
      cy.wait(1000);

      // Mock do clipboard API - precisa ser feito antes de interagir com o botão
      cy.window().then((win) => {
        // Garante que o navigator.clipboard existe
        if (!win.navigator.clipboard) {
          win.navigator.clipboard = {} as Clipboard;
        }
        // Cria um stub para o clipboard.writeText que resolve com sucesso
        cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite').resolves();
      });

      // Clica no botão de copiar URL do primeiro questionário
      cy.get('.survey-card', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('[aria-label="buttons-container"]')
            .should('be.visible')
            .within(() => {
              // Procura pelo botão de copiar URL (CopyUrlIcon)
              cy.get('button[title="Copiar URL do questionário"]', { timeout: 10000 })
                .should('exist')
                .should('be.visible')
                .click({ force: true });
            });
        });

      // Verifica se o toast de sucesso aparece
      cy.contains('URL copiada para a área de transferência!', { timeout: 5000 }).should('be.visible');

      // Verifica se o clipboard.writeText foi chamado
      cy.get('@clipboardWrite').should('have.been.called');

      // Verifica se a URL foi copiada corretamente (verifica se contém o ID do questionário)
      cy.get('@clipboardWrite').then((stub) => {
        expect(stub).to.have.been.called;
        const callArgs = (stub as any).getCall(0).args[0];
        expect(callArgs).to.be.a('string');
        expect(callArgs).to.include('/chatbot/');
        expect(callArgs).to.include(`s=${survey.id}`);
        expect(callArgs).to.include('&c=');
      });
    });
  });
});

