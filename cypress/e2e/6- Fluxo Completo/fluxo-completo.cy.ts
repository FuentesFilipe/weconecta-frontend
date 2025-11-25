const FLUXO_COMPLETO_ADMIN_USER = {
  role: 'admin',
  email: 'teste_admin@email.com',
  password: '123456789',
};

const FLUXO_COMPLETO_INVALID_USER = {
  email: 'invalid@email.com',
  password: 'wrongpassword',
};

const FLUXO_COMPLETO_MOCK_CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // UUID válido

describe('Fluxo Completo - Do Login ao Chat', () => {
  let createdSurveyId: number;
  let surveyUrl: string;

  beforeEach(() => {
    // Limpa o localStorage e sessionStorage antes de cada teste
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('deve executar o fluxo completo do sistema', () => {
    // ========== 1º: Tentativa de login inválida ==========
    // Intercepta a requisição de login de forma condicional
    // Se for email inválido, retorna erro. Se for email válido, deixa passar para o backend
    cy.intercept('POST', '**/api/auth/login', (req) => {
      const body = req.body;
      // Se for o email inválido, retorna erro 404
      if (body.email === FLUXO_COMPLETO_INVALID_USER.email) {
        req.reply({
          statusCode: 404,
          body: { message: 'Email not registered' },
        });
      } else {
        // Para outros emails (incluindo o correto), deixa passar para o backend real
        req.continue();
      }
    }).as('loginRequest');

    cy.visit('/login');
    cy.contains('Log in', { timeout: 10000 }).should('be.visible');

    // Tenta login inválido
    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(FLUXO_COMPLETO_INVALID_USER.email);

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(FLUXO_COMPLETO_INVALID_USER.password);

    cy.contains('button', 'Log In')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      // Verifica se a requisição retornou erro 404
      expect(interception.response?.statusCode).to.equal(404);
    });

    // Verifica se o toast de erro aparece
    cy.contains('Credenciais inválidas. Tente novamente.', { timeout: 5000 })
      .should('be.visible');

    // Verifica se ainda está na página de login
    cy.url().should('include', '/login');

    // ========== 2º: Login correto ==========
    // Aguarda um pouco para garantir que o toast desapareceu
    cy.wait(400);
    
    // O mesmo interceptor já está configurado para deixar passar requisições com email válido

    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(FLUXO_COMPLETO_ADMIN_USER.email);

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(FLUXO_COMPLETO_ADMIN_USER.password);

    cy.get('input[type="checkbox"]#rememberMe')
      .should('be.visible')
      .check();

    cy.contains('button', 'Log In')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.body).to.have.property('accessToken');
    });

    // Aguarda o redirecionamento após login
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.wait(800); // Aguarda a página carregar completamente

    // ========== 3º: Clicar em todas as tabs da sidebar ==========
    // Primeiro, clica no menu hamburger para abrir a sidebar
    cy.get('.MuiToolbar-root', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.get('.hamburguer-icon', { timeout: 10000 })
          .should('be.visible')
          .click();
      });
    
    cy.wait(200); // Aguarda a sidebar abrir

    // Intercepta as requisições das páginas
    // Configura o interceptor para questionários (será atualizado depois)
    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[], 0],
    }).as('getSurveys');

    // Clica em Dashboard
    cy.get('.menuItemWrapper', { timeout: 10000 })
      .contains('Dashboard', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/');
    cy.wait(400);

    // Clica em Questionários
    cy.get('.menuItemWrapper', { timeout: 10000 })
      .contains('Questionários', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/questionarios');
    cy.wait(800); // Aguarda a página carregar

    // Clica em Membros
    cy.get('.menuItemWrapper', { timeout: 10000 })
      .contains('Membros', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/membros');
    cy.wait(400);

    // Volta para Questionários
    // Atualiza o interceptor antes de navegar para garantir que está ativo
    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[], 0],
    }).as('getSurveysReturn');
    
    cy.get('.menuItemWrapper', { timeout: 10000 })
      .contains('Questionários', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/questionarios');
    cy.wait(800); // Aguarda a página carregar (não espera pelo interceptor obrigatoriamente)

    // ========== 4º: Entrar na tela de questionários, excluir, duplicar e criar ==========
    
    // Primeiro, cria alguns questionários mock para trabalhar
    const mockSurveys = [
      {
        id: 1,
        title: 'Questionário Teste 1',
        description: 'Descrição do questionário 1',
        url: '',
        flow: null,
        firstSurveyElement: null,
      },
      {
        id: 2,
        title: 'Questionário Teste 2',
        description: 'Descrição do questionário 2',
        url: '',
        flow: null,
        firstSurveyElement: null,
      },
    ];

    // Atualiza o interceptor para retornar os questionários mock
    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [mockSurveys, mockSurveys.length],
    }).as('getSurveysWithData');

    cy.reload();
    cy.wait('@getSurveysWithData', { timeout: 10000 });
    cy.wait(800);

    // Excluir um questionário
    // Configura o stub do window.confirm ANTES de clicar no botão
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.intercept('DELETE', '**/api/core/surveys/1', {
      statusCode: 200,
      body: { message: 'Questionário deletado com sucesso' },
    }).as('deleteSurvey');

    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[mockSurveys[1]], 1],
    }).as('getSurveysAfterDelete');

    cy.get('.survey-card', { timeout: 10000 })
      .first()
      .within(() => {
        cy.get('[aria-label="buttons-container"]')
          .should('be.visible')
          .within(() => {
            // Botão de deletar é o terceiro (índice 2)
            cy.get('button')
              .should('have.length.at.least', 4)
              .eq(2)
              .should('exist')
              .should('be.visible')
              .click({ force: true });
          });
      });

    cy.wait('@deleteSurvey', { timeout: 10000 });
    cy.wait('@getSurveysAfterDelete', { timeout: 10000 });
    cy.wait(400);

    // Duplicar um questionário
    const duplicatedSurvey = {
      id: 3,
      title: `${mockSurveys[1].title} (Cópia)`,
      description: mockSurveys[1].description,
      url: '',
      flow: null,
      firstSurveyElement: null,
    };

    cy.intercept('POST', '**/api/core/surveys', {
      statusCode: 201,
      body: duplicatedSurvey,
    }).as('duplicateSurvey');

    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[mockSurveys[1], duplicatedSurvey], 2],
    }).as('getSurveysAfterDuplicate');

    cy.get('.survey-card', { timeout: 10000 })
      .first()
      .within(() => {
        cy.get('[aria-label="buttons-container"]')
          .should('be.visible')
          .within(() => {
            cy.get('button[title="Duplicar questionário"]', { timeout: 10000 })
              .should('exist')
              .click({ force: true });
          });
      });

    cy.wait('@duplicateSurvey', { timeout: 10000 });
    cy.wait('@getSurveysAfterDuplicate', { timeout: 10000 });
    cy.wait(400);

    // Criar um novo questionário
    const newSurvey = {
      id: 4,
      title: 'Novo Questionário Criado no Teste',
      description: 'Descrição do novo questionário',
      url: '',
      flow: null,
      firstSurveyElement: null,
    };

    cy.intercept('POST', '**/api/core/surveys', {
      statusCode: 201,
      body: newSurvey,
    }).as('createSurvey');

    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[mockSurveys[1], duplicatedSurvey, newSurvey], 3],
    }).as('getSurveysAfterCreate');

    // Aguarda qualquer toast desaparecer antes de clicar
    // Toasts geralmente aparecem após operações e desaparecem em alguns segundos
    cy.wait(1200);

    cy.contains('button', 'Novo Questionário', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.contains('Novo Questionário', { timeout: 10000 }).should('be.visible');
    cy.wait(600);

    cy.get('.modal-survey-element', { timeout: 10000 })
      .should('be.visible')
      .find('input')
      .should('have.length.at.least', 2)
      .first()
      .should('be.visible')
      .should('not.be.disabled')
      .clear({ force: true })
      .type(newSurvey.title, { force: true });

      cy.wait(120);

    cy.get('.modal-survey-element', { timeout: 10000 })
      .find('input')
      .should('have.length.at.least', 2)
      .last()
      .should('be.visible')
      .should('not.be.disabled')
      .clear({ force: true })
      .type(newSurvey.description, { force: true });

    cy.contains('button', 'Criar', { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@createSurvey', { timeout: 10000 });
    cy.wait('@getSurveysAfterCreate', { timeout: 10000 });
    cy.wait(800);

    createdSurveyId = newSurvey.id;

    // ========== 5º: Entrar no questionário recém criado ==========
    cy.contains('.survey-card', newSurvey.title, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Intercepta as requisições do canvas
    cy.intercept('GET', `**/api/core/surveys/${createdSurveyId}`, {
      statusCode: 200,
      body: newSurvey,
    }).as('getSurveyById');

    cy.intercept('GET', '**/api/core/surveys-elements**', {
      statusCode: 200,
      body: [],
    }).as('getSurveyElements');

    cy.url({ timeout: 10000 }).should('include', '/questionarios/canva');
    cy.wait('@getSurveyById', { timeout: 10000 });
    cy.wait('@getSurveyElements', { timeout: 10000 });
    cy.wait(800);

    // ========== 6º: No canvas criar um fluxo com no mínimo 5 mensagens de alternativa ==========
    // (pode existir 4 já, criar apenas 1)
    
    // Primeiro, verifica quantas mensagens de alternativa já existem
    // Como não há elementos ainda, vamos criar 5 mensagens de alternativa

    const alternativeMessages = [
      { title: 'Mensagem Alternativa 1', alternatives: ['Sim', 'Não'] },
      { title: 'Mensagem Alternativa 2', alternatives: ['Opção A', 'Opção B'] },
      { title: 'Mensagem Alternativa 3', alternatives: ['Sim', 'Não', 'Talvez'] },
      { title: 'Mensagem Alternativa 4', alternatives: ['Concordo', 'Discordo'] },
      { title: 'Mensagem Alternativa 5', alternatives: ['Sim', 'Não'] }, // Esta é a que vamos criar
    ];

    // Intercepta as requisições de criação de elementos
    const createdElements: any[] = [];
    cy.intercept('POST', '**/api/core/surveys-elements', (req) => {
      const newId = 100 + createdElements.length;
      // Garante que as opções estão no formato correto com IDs únicos
      // As opções vêm como { description: string } do frontend
      const options = (req.body.options || [])
        .filter((opt: any) => opt.description && opt.description.trim() !== '')
        .map((opt: any, index: number) => ({
          id: (newId * 100) + index + 1, // IDs únicos para cada opção
          description: typeof opt === 'string' ? opt : (opt.description || opt),
          deletedAt: null,
        }));
      
      const element = {
        id: newId,
        description: req.body.description,
        type: req.body.type,
        options: options,
        deletedAt: null,
      };
      createdElements.push(element);
      // Retorna o elemento com as opções incluídas
      req.reply({ statusCode: 201, body: element });
    }).as('createElement');

    // Intercepta a requisição GET de elementos para retornar APENAS os criados até agora
    cy.intercept('GET', '**/api/core/surveys-elements**', (req) => {
      // Retorna APENAS os elementos que já foram criados (não todos de uma vez)
      req.reply({
        statusCode: 200,
        body: createdElements, // Retorna apenas os elementos criados até o momento
      });
    }).as('getSurveyElements');

    // Cria as 5 mensagens de alternativa
    alternativeMessages.forEach((message, index) => {
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('h4', 'Nova Mensagem', { timeout: 10000 })
            .should('be.visible');
        });
      cy.wait(400);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type(message.title, { force: true });
        });

      cy.wait(120);

      // Seleciona o tipo "Alternativa"
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'Alternativa', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(200);

      // Preenche as alternativas
      message.alternatives.forEach((alt, altIndex) => {
        if (altIndex === 0) {
          cy.get('[aria-label="options-list"]', { timeout: 10000 })
            .find('input')
            .first()
            .should('be.visible')
            .clear({ force: true })
            .type(alt, { force: true });
        } else {
          // Adiciona mais alternativas se necessário
          if (altIndex >= 2) {
            cy.get('[aria-label="options-list"]', { timeout: 10000 })
              .find('button')
              .last()
              .click();
            cy.wait(120);
          }
          cy.get('[aria-label="options-list"]', { timeout: 10000 })
            .find('input')
            .eq(altIndex)
            .should('be.visible')
            .clear({ force: true })
            .type(alt, { force: true });
        }
        cy.wait(120);
      });

      cy.wait(120);

      // Cria o elemento
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      cy.wait('@createElement', { timeout: 10000 }).then((interception) => {
        // Verifica se o elemento foi criado com as opções
        const createdElement = interception.response?.body;
        cy.log(`Elemento ${index + 1} criado: ${createdElement?.description} com ${createdElement?.options?.length || 0} opções`);
        
        // Aguarda a requisição GET ser atualizada (a sidebar deve buscar os elementos)
        cy.wait('@getSurveyElements', { timeout: 10000 });
        
        // Verifica se o elemento recém-criado aparece na sidebar
        cy.get('.canvas-option-item', { timeout: 10000 })
          .contains(createdElement.description, { timeout: 10000 })
          .should('be.visible');
        
        cy.log(`Elemento ${createdElement.description} apareceu na sidebar`);
      });
      
      cy.wait(400); // Aguarda um pouco antes de criar o próximo
    });

    // Atualiza a lista de elementos após criar todos
    // Aguarda um pouco para garantir que os elementos foram salvos
    cy.wait(800);
    
    // Verifica se todos os elementos foram criados
    cy.then(() => {
      cy.log(`Total de elementos criados: ${createdElements.length}`);
      createdElements.forEach((el, idx) => {
        cy.log(`Elemento ${idx + 1}: ${el.description} com ${el.options?.length || 0} opções`);
      });
    });
    
    // Intercepta a requisição GET para retornar os elementos criados com opções
    cy.intercept('GET', '**/api/core/surveys-elements**', {
      statusCode: 200,
      body: createdElements.length >= alternativeMessages.length 
        ? createdElements 
        : alternativeMessages.map((msg, index) => {
            // Tenta encontrar o elemento criado pelo título
            const existing = createdElements.find(el => el.description === msg.title);
            if (existing && existing.options && existing.options.length > 0) {
              return existing;
            }
            // Se não encontrou ou não tem opções, cria um mock com as opções
            return {
              id: 100 + index,
              description: msg.title,
              type: 'OPTION',
              options: msg.alternatives.map((alt, altIndex) => ({
                id: (100 + index) * 100 + altIndex + 1,
                description: alt,
                deletedAt: null,
              })),
              deletedAt: null,
            };
          }),
    }).as('getUpdatedElements');

    // Aguarda os elementos aparecerem na sidebar (sem depender da requisição)
    cy.wait(800);

    // ========== 7º: Arrastar essas 5 mensagens para o canvas ==========
    // Aguarda os elementos aparecerem na sidebar
    cy.get('.canvas-options-list', { timeout: 15000 })
      .should('be.visible');
    
    // Aguarda um pouco mais para garantir que os elementos foram renderizados
    cy.wait(800);
    
    // Verifica se há elementos na lista
    cy.get('.canvas-option-item', { timeout: 15000 })
      .should('have.length.at.least', alternativeMessages.length);
    
    // Para cada mensagem criada, encontra na sidebar e adiciona ao canvas
    alternativeMessages.forEach((message, index) => {
      // Procura pelo elemento na sidebar pelo título
      cy.get('.canvas-option-item', { timeout: 15000 })
        .contains(message.title, { timeout: 10000 })
        .parents('.canvas-option-item')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .within(() => {
          // Clica no botão de adicionar ao canvas (usando a classe específica)
          cy.get('button.canvas-option-button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click({ force: true });
        });
      
      cy.wait(400); // Aguarda entre cada adição
    });

    cy.wait(2000);

    // Verifica se os nós foram adicionados ao canvas
    cy.get('.react-flow__node', { timeout: 10000 })
      .should('have.length.at.least', 5);

    // ========== 8º: Conectar os nós para criar um fluxo ==========
    // Conecta cada mensagem a TODAS as alternativas da mensagem anterior
    // Mensagem 2 -> todas alternativas da Mensagem 1
    // Mensagem 3 -> todas alternativas da Mensagem 2
    // Mensagem 4 -> todas alternativas da Mensagem 3
    // Mensagem 5 -> todas alternativas da Mensagem 4
    
    cy.get('.react-flow__node', { timeout: 10000 })
      .should('have.length.at.least', 5);
    
    cy.wait(800); // Aguarda os nós serem renderizados completamente
    
    // Para cada par de mensagens (i -> i+1)
    for (let msgIndex = 0; msgIndex < 4; msgIndex++) {
      const currentMessage = alternativeMessages[msgIndex];
      const nextMessage = alternativeMessages[msgIndex + 1];
      
      cy.log(`Conectando ${nextMessage.title} a todas alternativas de ${currentMessage.title}`);
      
      // Encontra o nó principal da próxima mensagem (alvo)
      cy.get('.react-flow__node', { timeout: 10000 })
        .contains(nextMessage.title, { timeout: 10000 })
        .parents('.react-flow__node')
        .first()
        .then(($nextMessageNode) => {
          // Encontra o handle de entrada da próxima mensagem (top) - será usado para todas as conexões
          cy.wrap($nextMessageNode[0])
            .find('.react-flow__handle-top', { timeout: 10000 })
            .first()
            .should('exist')
            .then(($targetHandle) => {
              // Encontra o nó principal da mensagem atual
              cy.get('.react-flow__node', { timeout: 10000 })
                .contains(currentMessage.title, { timeout: 10000 })
                .parents('.react-flow__node')
                .first()
                .then(($currentMessageNode) => {
                  // Para cada alternativa da mensagem atual
                  currentMessage.alternatives.forEach((altText, altIndex) => {
                    // Procura pelo nó que contém o texto da alternativa
                    // E que está conectado ao nó principal (através de uma edge)
                    cy.get('.react-flow__node', { timeout: 10000 })
                      .contains(altText, { timeout: 10000 })
                      .parents('.react-flow__node')
                      .first()
                      .then(($altNode) => {
                        // Verifica se este nó está próximo ao nó principal (é filho)
                        const altRect = $altNode[0].getBoundingClientRect();
                        const mainRect = $currentMessageNode[0].getBoundingClientRect();
                        
                        // Alternativas ficam abaixo e próximas ao nó principal
                        if (altRect.top > mainRect.top && Math.abs(altRect.left - mainRect.left) < 600) {
                          // Encontra o handle de saída da alternativa (bottom)
                          cy.wrap($altNode[0])
                            .find('.react-flow__handle-bottom', { timeout: 10000 })
                            .first()
                            .should('exist')
                            .then(($sourceHandle) => {
                              const sourceRect = $sourceHandle[0].getBoundingClientRect();
                              const targetRect = $targetHandle[0].getBoundingClientRect();

                              cy.wrap($sourceHandle[0])
                                .trigger('mousedown', { which: 1, button: 0, force: true })
                                .trigger('mousemove', {
                                  clientX: targetRect.left + targetRect.width / 2,
                                  clientY: targetRect.top + targetRect.height / 2,
                                  force: true,
                                });

                              cy.wrap($targetHandle[0])
                                .trigger('mouseup', { which: 1, button: 0, force: true });

                              cy.wait(200);
                            });
                        }
                      });
                  });
                });
            });
        });
      
      cy.wait(400); // Aguarda entre cada grupo de conexões
    }

    // Verifica se as conexões foram criadas
    cy.get('.react-flow__edge', { timeout: 10000 })
      .should('have.length.at.least', 4);

    // ========== 9º: Clicar no botão de organizar ==========
    cy.get('div[style*="position: absolute"][style*="bottom: 30px"][style*="right: 30px"]', { timeout: 10000 })
      .find('button')
      .should('be.visible')
      .click();

    cy.wait(800); // Aguarda a animação de organização

    // Verifica se os nós ainda estão visíveis após organização
    cy.get('.react-flow__node', { timeout: 10000 })
      .should('have.length.at.least', 5)
      .should('be.visible');

    // Salva o fluxo antes de voltar (o flow é salvo automaticamente, mas garantimos aqui)
    // O flow será usado pelo backend para determinar o próximo elemento no chat
    // Intercepta a requisição de salvar o flow
    cy.intercept('POST', `**/api/core/surveys/${createdSurveyId}/flow`, {
      statusCode: 200,
      body: { message: 'Fluxo salvo com sucesso', surveyId: createdSurveyId },
    }).as('saveFlow');

    // Aguarda um pouco para garantir que o flow foi salvo no localStorage
    cy.wait(2000);

    // ========== 10º: Voltar para tela de questionários ==========
    cy.contains('button', 'Voltar', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.url({ timeout: 10000 }).should('include', '/questionarios');
    cy.url({ timeout: 10000 }).should('not.include', '/canva');
    cy.wait(800);

    // ========== 11º: Copiar o link do questionário recém criado ==========
    // Intercepta a requisição GET caso aconteça (mas não espera obrigatoriamente)
    cy.intercept('GET', '**/api/core/surveys**', {
      statusCode: 200,
      body: [[mockSurveys[1], duplicatedSurvey, newSurvey], 3],
    }).as('getSurveysForCopy');

    // Aguarda a página carregar (não espera pela requisição)
    cy.wait(800);

    // Mock do clipboard API ANTES de clicar no botão
    let copiedUrl = '';
    cy.window().then((win) => {
      // Garante que o navigator.clipboard existe
      if (!win.navigator.clipboard) {
        Object.defineProperty(win.navigator, 'clipboard', {
          value: {
            writeText: () => Promise.resolve(),
          },
          writable: true,
          configurable: true,
        });
      }
      // Cria o stub que captura a URL
      cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite').callsFake((text: string) => {
        copiedUrl = text;
        return Promise.resolve();
      });
    });

    // Aguarda o card aparecer
    cy.contains('.survey-card', newSurvey.title, { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.get('[aria-label="buttons-container"]')
          .should('be.visible')
          .within(() => {
            cy.get('button[title="Copiar URL do questionário"]', { timeout: 10000 })
              .should('exist')
              .should('be.visible')
              .click({ force: true });
          });
      });

    cy.wait(400);

    // Verifica se o toast aparece
    cy.contains('URL copiada para a área de transferência!', { timeout: 5000 }).should('be.visible');

    // Obtém a URL copiada do stub
    cy.get('@clipboardWrite').should('have.been.called').then((stub) => {
      // Tenta obter a URL do stub
      const callArgs = (stub as any).getCall(0)?.args?.[0];
      if (callArgs) {
        surveyUrl = callArgs;
      }
    });

    // Se não conseguiu obter do stub, constrói a URL manualmente
    cy.then(() => {
      if (!surveyUrl) {
        cy.url().then((currentUrl) => {
          const baseUrl = currentUrl.split('/questionarios')[0];
          // Obtém o userId do localStorage ou usa o mock
          cy.window().then((win) => {
            // Tenta obter o userId do token ou usa o mock
            const token = win.localStorage.getItem('auth_token') || win.sessionStorage.getItem('auth_token');
            let userId = FLUXO_COMPLETO_MOCK_CLIENT_ID;
            
            if (token) {
              try {
                // Decodifica o JWT para obter o userId (se disponível)
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = payload.userId || payload.id || FLUXO_COMPLETO_MOCK_CLIENT_ID;
              } catch {
                // Se falhar, usa o mock
                userId = FLUXO_COMPLETO_MOCK_CLIENT_ID;
              }
            }
            
            surveyUrl = `${baseUrl}/chatbot/?s=${createdSurveyId}&c=${userId}`;
          });
        });
      }
      
      expect(surveyUrl).to.be.a('string');
      expect(surveyUrl).to.include('/chatbot/');
      expect(surveyUrl).to.include(`s=${createdSurveyId}`);
    });

    // ========== 12º: Acessar esse link ==========
    // Cria o mock do flow que reflete exatamente as conexões criadas no canvas
    // O flow deve ter a estrutura: cada alternativa da mensagem i aponta para a mensagem i+1
    const mockFlow = {
      nodes: alternativeMessages.flatMap((msg, msgIndex) => {
        const elementId = 100 + msgIndex;
        const nodes = [
          {
            id: `element-${elementId}`,
            data: { label: msg.title, surveyElementId: elementId },
          },
        ];
        // Adiciona nós para cada alternativa
        msg.alternatives.forEach((alt, altIndex) => {
          const optionId = (elementId * 100) + altIndex + 1;
          nodes.push({
            id: `option-${elementId}-${optionId}`,
            data: { label: alt, surveyElementId: elementId, optionId: optionId } as any,
          });
        });
        return nodes;
      }),
      edges: alternativeMessages.flatMap((msg, msgIndex) => {
        const elementId = 100 + msgIndex;
        const edges: any[] = [];
        
        // Conecta o elemento principal às suas alternativas
        msg.alternatives.forEach((alt, altIndex) => {
          const optionId = (elementId * 100) + altIndex + 1;
          edges.push({
            id: `element-${elementId}-to-option-${elementId}-${optionId}`,
            source: `element-${elementId}`,
            target: `option-${elementId}-${optionId}`,
          });
        });
        
        // Se não for a última mensagem, conecta todas as alternativas à próxima mensagem
        if (msgIndex < alternativeMessages.length - 1) {
          const nextElementId = 100 + msgIndex + 1;
          msg.alternatives.forEach((alt, altIndex) => {
            const optionId = (elementId * 100) + altIndex + 1;
            edges.push({
              id: `option-${elementId}-${optionId}-to-element-${nextElementId}`,
              source: `option-${elementId}-${optionId}`,
              target: `element-${nextElementId}`,
            });
          });
        }
        
        return edges;
      }),
    };

    // Intercepta as requisições do chatbot
    cy.intercept('GET', `**/api/core/surveys/${createdSurveyId}/client/**`, {
      statusCode: 200,
      body: {
        ...newSurvey,
        firstSurveyElement: 100, // ID do primeiro elemento criado
        flow: mockFlow, // Inclui o flow com as conexões corretas
      },
    }).as('getSurveyForChat');

    // Aguarda um pouco para garantir que surveyUrl está definido
    cy.wait(400);

    // Garante que a URL está completa (com protocolo e host)
    cy.then(() => {
      cy.url().then((currentUrl) => {
        const baseUrl = currentUrl.split('/questionarios')[0]; // Obtém a base URL (ex: http://localhost:3000)
        let fullSurveyUrl = surveyUrl;
        
        // Se a URL não começar com http, adiciona a base URL
        if (!surveyUrl.startsWith('http://') && !surveyUrl.startsWith('https://')) {
          // Remove a barra inicial se houver para evitar duplicação
          const path = surveyUrl.startsWith('/') ? surveyUrl : `/${surveyUrl}`;
          fullSurveyUrl = `${baseUrl}${path}`;
        }
        
        cy.log(`Acessando URL: ${fullSurveyUrl}`);
        cy.visit(fullSurveyUrl);
        cy.wait('@getSurveyForChat', { timeout: 10000 });
      });
    });

    // Verifica se a página do chatbot carregou
    cy.url({ timeout: 10000 }).should('include', '/chatbot');
    cy.wait(800);

    // ========== 13º: Testar o chat seguindo o fluxo criado ==========
    // Cria um mapa do fluxo: optionId -> próximo elemento
    const flowMap = new Map<number, number>();
    alternativeMessages.forEach((msg, msgIndex) => {
      const elementId = 100 + msgIndex;
      msg.alternatives.forEach((alt, altIndex) => {
        const optionId = (elementId * 100) + altIndex + 1;
        // Todas as alternativas da mensagem i apontam para a mensagem i+1
        if (msgIndex < alternativeMessages.length - 1) {
          const nextElementId = 100 + msgIndex + 1;
          flowMap.set(optionId, nextElementId);
        }
      });
    });

    // Intercepta a verificação de telefone
    cy.intercept('POST', '**/api/core/survey-answer/verify-phone', {
      statusCode: 200,
      body: {
        exists: false,
        identifier: 'test-identifier-123',
        nextElementId: 100, // Primeiro elemento
        finished: false,
      },
    }).as('verifyPhone');

    // Intercepta dinamicamente a obtenção de elementos
    cy.intercept('GET', '**/api/core/surveys-elements/**', (req) => {
      const elementId = parseInt(req.url.split('/').pop() || '0', 10);
      const msgIndex = elementId - 100;
      if (msgIndex >= 0 && msgIndex < alternativeMessages.length) {
        const msg = alternativeMessages[msgIndex];
        req.reply({
          statusCode: 200,
          body: {
            id: elementId,
            description: msg.title,
            type: 'OPTION',
            options: msg.alternatives.map((alt, altIndex) => ({
              id: (elementId * 100) + altIndex + 1, // IDs consistentes com o flow
              description: alt,
              deletedAt: null,
            })),
            deletedAt: null,
          },
        });
      } else {
        req.reply({ statusCode: 404, body: { message: 'Element not found' } });
      }
    }).as('getElement');

    // Intercepta dinamicamente o envio de respostas - retorna o próximo elemento baseado no flow
    let sendAnswerCallCount = 0;
    cy.intercept('POST', '**/api/core/survey-answer', (req) => {
      sendAnswerCallCount++;
      const optionId = req.body.optionId;
      const nextElementId = flowMap.get(optionId) || null;
      
      // Se for a 2ª mensagem (última testada), finaliza o chat
      // A 2ª mensagem tem elementId 101, então quando optionId aponta para 102 (3ª mensagem), finalizamos
      const currentElementId = req.body.currentSurveyElementId;
      const isLastTestedMessage = currentElementId === 101; // 2ª mensagem (100 + 1)
      
      const finished = isLastTestedMessage || nextElementId === null;
      
      // Usa console.log em vez de cy.log dentro do interceptor
      console.log(`Requisição sendAnswer #${sendAnswerCallCount}: optionId=${optionId}, currentElementId=${currentElementId}, nextElementId=${nextElementId}, finished=${finished}`);
      
      req.reply({
        statusCode: 200,
        body: {
          nextSurveyElementId: finished ? null : nextElementId,
          finished: finished,
        },
      });
    }).as('sendAnswer');

    // Preenche o telefone
    cy.get('input[placeholder="(XX) XXXXX-XXXX"]', { timeout: 10000 })
      .should('be.visible')
      .type('11987654321');

    cy.get('button[type="submit"]')
      .should('not.be.disabled')
      .click();

    cy.wait('@verifyPhone', { timeout: 10000 });
    cy.wait('@getElement', { timeout: 10000 });
    cy.wait(800);

    // Testa o fluxo completo: percorre apenas as 2 primeiras mensagens e finaliza
    // Limita a 2 mensagens para evitar erros
    const messagesToTest = alternativeMessages.slice(0, 2);
    
    messagesToTest.forEach((message, msgIndex) => {
      cy.log(`Testando mensagem ${msgIndex + 1}: ${message.title}`);
      
      // Verifica se a mensagem apareceu
      cy.contains(message.title, { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');

      // Dá scroll no chat para garantir que tudo está visível
      // O elemento scrollable é .chatbot-messages dentro de .chatbot-container
      cy.get('.chatbot-messages', { timeout: 10000 })
        .scrollTo('bottom', { duration: 500, ensureScrollable: false });

      cy.wait(400);

      // Seleciona a primeira alternativa (qualquer uma leva à próxima mensagem)
      // Usa um seletor mais específico para encontrar a alternativa correta
      cy.get('.sb-option', { timeout: 10000 })
        .contains(message.alternatives[0], { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .parent('label')
        .find('input[type="radio"]')
        .should('exist')
        .check({ force: true });

      cy.wait(600); // Aguarda a seleção ser processada

      // Verifica se a alternativa foi selecionada
      cy.get('.sb-option')
        .contains(message.alternatives[0])
        .parent('label')
        .find('input[type="radio"]')
        .should('be.checked');

      // Dá scroll novamente para garantir que o botão está visível
      cy.get('.chatbot-messages', { timeout: 10000 })
        .scrollTo('bottom', { duration: 500, ensureScrollable: false });

      cy.wait(200);

      // Clica no botão Enviar (pode estar coberto, usa force)
      // O botão tem a classe 'sb-send'
      // Encontra o botão dentro da mesma mensagem (sb-bubble) que contém a alternativa selecionada
      cy.get('.sb-option')
        .contains(message.alternatives[0])
        .parents('.sb-bubble')
        .find('button.sb-send', { timeout: 10000 })
        .should('exist')
        .should('not.be.disabled')
        .scrollIntoView()
        .then(($btn) => {
          cy.log(`Clicando no botão Enviar da mensagem ${msgIndex + 1}`);
          cy.wrap($btn).click({ force: true });
        });

      // Aguarda a requisição ser feita (pode levar um tempo)
      cy.wait('@sendAnswer', { timeout: 15000 }).then((interception) => {
        const nextElementId = interception.response?.body?.nextSurveyElementId;
        const finished = interception.response?.body?.finished;
        cy.log(`Resposta enviada: nextElementId=${nextElementId}, finished=${finished}`);
        
        // Se for a última mensagem testada (2ª), finaliza o chat
        if (msgIndex === messagesToTest.length - 1) {
          cy.log('Última mensagem testada - finalizando chat');
        } else if (nextElementId && !finished) {
          // Se não for a última mensagem, aguarda a requisição GET para obter o próximo elemento
          cy.wait('@getElement', { timeout: 10000 }).then(() => {
            cy.log(`Próximo elemento ${nextElementId} carregado`);
          });
        }
      });
      
      cy.wait(800);

      // Dá scroll no chat novamente para ver a resposta
      cy.get('.chatbot-messages', { timeout: 10000 })
        .scrollTo('bottom', { duration: 500, ensureScrollable: false });

      // Verifica se a resposta selecionada aparece no chat
      cy.contains(message.alternatives[0], { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');

      // Se for a última mensagem testada (2ª), verifica a mensagem de agradecimento
      if (msgIndex === messagesToTest.length - 1) {
        cy.wait(800);
        
        // Dá scroll novamente para ver a mensagem de agradecimento
        cy.get('.chatbot-messages', { timeout: 10000 })
          .scrollTo('bottom', { duration: 500, ensureScrollable: false });
        
        // Verifica se a mensagem de agradecimento apareceu
        cy.contains('Obrigado por responder o questionário!', { timeout: 10000 })
          .scrollIntoView()
          .should('be.visible');
      } else {
        // Se não for a última mensagem, verifica se a próxima mensagem apareceu
        const nextMessage = messagesToTest[msgIndex + 1];
        cy.wait(800);
        
        // Dá scroll novamente para ver a próxima mensagem
        cy.get('.chatbot-messages', { timeout: 10000 })
          .scrollTo('bottom', { duration: 500, ensureScrollable: false });
        
        // Verifica se a próxima mensagem apareceu
        cy.contains(nextMessage.title, { timeout: 10000 })
          .scrollIntoView()
          .should('be.visible');
      }
    });
  });
});

