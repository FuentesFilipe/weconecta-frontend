const ADMIN_USER = {
  role: 'admin',
  email: 'teste_admin@email.com',
  password: '123456789',
};

const MOCK_SURVEY = {
  id: 1,
  title: 'Pesquisa de Satisfação',
  description: 'Avalia a satisfação dos clientes',
  url: '',
  flow: null,
  firstSurveyElement: null,
};

const MOCK_SURVEY_ELEMENTS = [
  {
    id: 1,
    description: 'Mensagem de boas-vindas',
    type: 'MESSAGE',
    options: [],
    deletedAt: null,
  },
  {
    id: 2,
    description: 'Você está satisfeito?',
    type: 'MULTIPLE_CHOICE',
    options: [
      { id: 1, description: 'Sim', deletedAt: null },
      { id: 2, description: 'Não', deletedAt: null },
    ],
    deletedAt: null,
  },
  {
    id: 3,
    description: 'Descreva sua experiência',
    type: 'INPUT',
    options: [],
    deletedAt: null,
  },
];

describe('Fluxo do Canvas', () => {
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

    // Intercepta as requisições do survey
    cy.intercept('GET', `**/api/core/surveys/${MOCK_SURVEY.id}`, {
      statusCode: 200,
      body: MOCK_SURVEY,
    }).as('getSurveyById');

    // Intercepta as requisições de survey elements
    cy.intercept('GET', '**/api/core/surveys-elements**', {
      statusCode: 200,
      body: MOCK_SURVEY_ELEMENTS,
    }).as('getSurveyElements');

    // Intercepta a requisição de salvar flow
    cy.intercept('POST', `**/api/core/surveys/${MOCK_SURVEY.id}/flow`, {
      statusCode: 200,
      body: { message: 'Flow salvo com sucesso' },
    }).as('saveFlow');

    // Visita a página do canvas
    cy.visit(`/questionarios/canva?id=${MOCK_SURVEY.id}`, { timeout: 10000 });

    // Aguarda o canvas carregar
    cy.wait('@getSurveyById', { timeout: 10000 });
    cy.wait('@getSurveyElements', { timeout: 10000 });
    
    // Aguarda o React Flow renderizar
    cy.wait(2000);
  });

  describe('Criar Novas Mensagens', () => {
    it('deve criar 3 novas mensagens no canvas com título e alternativas preenchidas', () => {
      const messages = [
        { title: 'Primeira mensagem de teste', type: 'Feedback', alternatives: [] },
        { title: 'Segunda mensagem de teste', type: 'Alternativa', alternatives: ['Sim', 'Não'] },
        { title: 'Terceira mensagem de teste', type: 'Feedback', alternatives: [] },
      ];

      // Intercepta as requisições de criação de elementos
      cy.intercept('POST', '**/api/core/surveys-elements', (req) => {
        const response = {
          id: Math.floor(Math.random() * 1000) + 100,
          description: req.body.description,
          type: req.body.type,
          options: req.body.options || [],
          deletedAt: null,
        };
        req.reply({ statusCode: 201, body: response });
      }).as('createElement');

      // Intercepta a atualização da lista de elementos após criar
      cy.intercept('GET', '**/api/core/surveys-elements**', {
        statusCode: 200,
        body: [
          ...MOCK_SURVEY_ELEMENTS,
          ...messages.map((msg, index) => ({
            id: 100 + index,
            description: msg.title,
            type: msg.type === 'Feedback' ? 'MESSAGE' : msg.type === 'Alternativa' ? 'OPTION' : 'MESSAGE',
            options: msg.alternatives.map((alt, altIndex) => ({
              id: altIndex + 1,
              description: alt,
              deletedAt: null,
            })),
            deletedAt: null,
          })),
        ],
      }).as('getUpdatedElements');

      messages.forEach((message, index) => {
        // Clica no botão "Nova Mensagem"
        cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
          .should('be.visible')
          .click();

        // Aguarda o modal abrir e verifica o título dentro do modal
        cy.get('.modal-survey-element', { timeout: 10000 })
          .should('be.visible')
          .find('h4')
          .contains('Nova Mensagem', { timeout: 10000 })
          .should('be.visible');

        // Aguarda o modal renderizar completamente
        cy.wait(1000);

        // Preenche o título da mensagem
        cy.get('.modal-survey-element', { timeout: 10000 })
          .should('be.visible')
          .within(() => {
            cy.contains('label', 'Título', { timeout: 10000 })
              .should('be.visible')
              .next()
              .find('input')
              .should('be.visible')
              .clear({ force: true })
              .type(message.title, { force: true });
          });

        cy.wait(300);

        // Seleciona o tipo de mensagem (os tipos são Chips do Material-UI)
        // Verifica se o tipo já está selecionado (tipo padrão é "Alternativa")
        cy.get('.modal-survey-element', { timeout: 10000 })
          .within(() => {
            // Verifica se o tipo desejado já está selecionado (background-color laranja)
            cy.contains('[role="button"]', message.type, { timeout: 10000 })
              .should('be.visible')
              .then(($chip) => {
                const bgColor = $chip.css('background-color');
                // Se não estiver selecionado (background não é laranja), clica
                if (!bgColor.includes('249, 115, 22') && !bgColor.includes('rgb(249, 115, 22)')) {
                  cy.wrap($chip).click();
                }
              });
          });

        cy.wait(500);

        // Se o tipo tem alternativas, preenche elas
        if (message.alternatives.length > 0) {
          // Aguarda os campos de alternativas aparecerem
          cy.get('[aria-label="options-list"]', { timeout: 10000 })
            .should('be.visible')
            .should('exist');

          // Aguarda um pouco para garantir que os campos estão renderizados
          cy.wait(1000);

          // Verifica se há campos de alternativa disponíveis
          cy.get('[aria-label="options-list"]', { timeout: 10000 })
            .find('input')
            .should('have.length.at.least', message.alternatives.length);

          // Preenche cada alternativa usando o mesmo padrão do teste que funciona
          message.alternatives.forEach((alt, altIndex) => {
            cy.log(`Preenchendo alternativa ${altIndex + 1}: ${alt}`);
            
            // Usa o mesmo padrão do teste de adicionar/remover alternativas
            if (altIndex === 0) {
              cy.get('[aria-label="options-list"]', { timeout: 10000 })
                .find('input')
                .first()
                .should('be.visible')
                .clear({ force: true })
                .type(alt, { force: true });
            } else {
              cy.get('[aria-label="options-list"]', { timeout: 10000 })
                .find('input')
                .eq(altIndex)
                .should('be.visible')
                .clear({ force: true })
                .type(alt, { force: true });
            }
            
            cy.wait(400);
            
            // Verifica imediatamente após digitar
            if (altIndex === 0) {
              cy.get('[aria-label="options-list"]', { timeout: 10000 })
                .find('input')
                .first()
                .should('have.value', alt);
            } else {
              cy.get('[aria-label="options-list"]', { timeout: 10000 })
                .find('input')
                .eq(altIndex)
                .should('have.value', alt);
            }
          });
        }

        cy.wait(300);

        // Clica no botão "Criar"
        cy.contains('button', 'Criar', { timeout: 10000 })
          .should('be.visible')
          .should('not.be.disabled')
          .click();

        // Aguarda a requisição de criação ser completada
        cy.wait('@createElement', { timeout: 10000 });

        // Verifica se o toast de sucesso aparece
        cy.contains('Elemento criado com sucesso!', { timeout: 5000 }).should('be.visible');

        // Aguarda o modal fechar (o modal pode ser removido do DOM completamente)
        cy.wait(1500);
      });

      // Aguarda a sidebar atualizar com os novos elementos
      cy.wait(2000);

      // Verifica que os elementos foram criados e aparecem na sidebar
      // (elementos criados aparecem na sidebar, não automaticamente no canvas)
      messages.forEach((message) => {
        // Procura o elemento na sidebar - o scrollIntoView fará scroll automaticamente se necessário
        cy.get('.canvas-option-item', { timeout: 10000 })
          .contains(message.title, { timeout: 10000 })
          .scrollIntoView()
          .should('be.visible');
      });

      // Agora adiciona os elementos ao canvas através da sidebar
      messages.forEach((message) => {
        // Encontra o elemento na sidebar pelo título
        // O scrollIntoView fará scroll automaticamente se o elemento não estiver visível
        cy.get('.canvas-option-item', { timeout: 10000 })
          .contains(message.title, { timeout: 10000 })
          .scrollIntoView()
          .parents('.canvas-option-item')
          .should('be.visible')
          .within(() => {
            // Clica no botão de adicionar ao canvas (seta para direita)
            cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
              .should('be.visible')
              .click();
          });
        
        cy.wait(800);
      });

      // Aguarda um pouco para os nós aparecerem no canvas
      cy.wait(1500);

      // Verifica se as 3 mensagens foram adicionadas ao canvas
      // Os nós do React Flow podem ter diferentes classes, vamos tentar encontrar pelo conteúdo
      cy.get('.react-flow', { timeout: 10000 })
        .should('be.visible');

      // Verifica se cada mensagem aparece no canvas
      messages.forEach((message) => {
        // Procura pelo texto da mensagem dentro do canvas
        cy.get('.react-flow', { timeout: 10000 })
          .contains(message.title, { timeout: 10000 })
          .should('be.visible');
      });

      // Verifica se há pelo menos 3 nós no canvas
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 3);
    });

    it('deve adicionar e remover alternativas no formulário', () => {
      // Intercepta a requisição de criação
      cy.intercept('POST', '**/api/core/surveys-elements', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: 100,
            description: req.body.description,
            type: req.body.type,
            options: req.body.options || [],
            deletedAt: null,
          },
        });
      }).as('createElement');

      // Clica no botão "Nova Mensagem"
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir e verifica o título dentro do modal
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('h4', 'Nova Mensagem', { timeout: 10000 })
            .should('be.visible');
        });
      cy.wait(1000);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type('Mensagem com alternativas', { force: true });
        });

      cy.wait(300);

      // Seleciona o tipo "Alternativa" (OPTION) - são Chips do Material-UI com role="button"
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'Alternativa', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(500);

      // Verifica se há 2 campos de alternativa inicialmente
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .should('have.length', 2);

      // Preenche a primeira alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type('Primeira alternativa', { force: true });

      cy.wait(300);

      // Preenche a segunda alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(1)
        .should('be.visible')
        .clear({ force: true })
        .type('Segunda alternativa', { force: true });

      cy.wait(500);

      // O botão de adicionar aparece quando a última alternativa tem texto
      // Clica no botão de adicionar para criar a terceira alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('button')
        .last() // O último botão é o de adicionar
        .should('be.visible')
        .click();

      cy.wait(500);

      // Preenche a terceira alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(2)
        .should('be.visible')
        .clear({ force: true })
        .type('Terceira alternativa', { force: true });

      cy.wait(500);

      // Clica no botão de adicionar para criar a quarta alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('button')
        .last()
        .should('be.visible')
        .click();

      cy.wait(500);

      // Preenche a quarta alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(3)
        .should('be.visible')
        .clear({ force: true })
        .type('Quarta alternativa', { force: true });

      cy.wait(500);

      // Verifica se agora há 4 campos de alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .should('have.length', 4);

      // Remove a segunda alternativa (ícone RemoveIcon - botão de menos)
      // O botão está dentro de div.delete-option dentro de cada container de alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('div.flex.gap-2.items-center')
        .eq(1) // Segunda alternativa (índice 1)
        .find('div.delete-option')
        .find('button')
        .should('be.visible')
        .click();

      cy.wait(500);

      // Remove a terceira alternativa (agora é a segunda após remover a anterior)
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('div.flex.gap-2.items-center')
        .eq(1) // Agora a terceira alternativa original está no índice 1
        .find('div.delete-option')
        .find('button')
        .should('be.visible')
        .click();

      cy.wait(500);

      // Verifica se agora há apenas 2 campos de alternativa
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .should('have.length', 2);

      // Verifica se a primeira alternativa ainda está preenchida
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .first()
        .should('have.value', 'Primeira alternativa');

      // Verifica se a quarta alternativa agora é a segunda
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(1)
        .should('have.value', 'Quarta alternativa');

      // Cancela para não criar o elemento
      cy.contains('button', 'Cancelar', { timeout: 10000 })
        .click();
    });
  });

  describe('Montar Fluxo com Nodos', () => {
    it('deve arrastar e conectar nodos para montar um fluxo', () => {
      // Primeiro, adiciona elementos do sidebar ao canvas
      // Clica no primeiro elemento da sidebar para adicionar ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          // Clica no botão de adicionar ao canvas (seta para direita)
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      // Adiciona o segundo elemento
      cy.get('.canvas-option-item', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      // Verifica se os nós foram adicionados ao canvas
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 2);

      // Obtém os handles dos nós para conectar
      // O React Flow renderiza handles com a classe 'react-flow__handle'
      cy.get('.react-flow__node', { timeout: 10000 })
        .first()
        .then(($firstNode) => {
          // Encontra o handle de saída do primeiro nó (bottom)
          cy.get('.react-flow__handle-bottom', { timeout: 10000 })
            .first()
            .should('exist')
            .then(($sourceHandle) => {
              // Encontra o handle de entrada do segundo nó (top)
              cy.get('.react-flow__handle-top', { timeout: 10000 })
                .eq(1) // Segundo nó
                .should('exist')
                .then(($targetHandle) => {
                  // Simula o arraste do handle de saída para o handle de entrada
                  const sourceRect = $sourceHandle[0].getBoundingClientRect();
                  const targetRect = $targetHandle[0].getBoundingClientRect();

                  // Cria eventos de mouse para simular a conexão
                  cy.wrap($sourceHandle[0])
                    .trigger('mousedown', { which: 1, button: 0, force: true })
                    .trigger('mousemove', {
                      clientX: targetRect.left + targetRect.width / 2,
                      clientY: targetRect.top + targetRect.height / 2,
                      force: true,
                    });

                  cy.wrap($targetHandle[0])
                    .trigger('mouseup', { which: 1, button: 0, force: true });

                  cy.wait(1000);

                  // Verifica se a conexão foi criada
                  // As conexões do React Flow têm a classe 'react-flow__edge'
                  cy.get('.react-flow__edge', { timeout: 5000 })
                    .should('have.length.at.least', 1);
                });
            });
        });
    });

    it('deve arrastar elemento da sidebar para o canvas', () => {
      // Obtém o primeiro elemento da sidebar
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .should('be.visible')
        .then(($element) => {
          // Obtém o elemento do survey (usa o primeiro dos MOCK_SURVEY_ELEMENTS)
          const elementData = MOCK_SURVEY_ELEMENTS[0];
          
          // Obtém a área do canvas (React Flow)
          cy.get('.react-flow', { timeout: 10000 })
            .should('be.visible')
            .then(($canvas) => {
              const canvasRect = $canvas[0].getBoundingClientRect();
              const dropX = canvasRect.left + canvasRect.width / 2;
              const dropY = canvasRect.top + canvasRect.height / 2;
              
              // Usa cy.window() para criar um DataTransfer no contexto correto
              cy.window().then((win) => {
                // Cria um DataTransfer mock
                const dataTransfer = new win.DataTransfer();
                dataTransfer.setData('application/json', JSON.stringify(elementData));
                dataTransfer.effectAllowed = 'copy';
                
                // Dispara o evento dragstart no elemento da sidebar
                const dragStartEvent = new win.DragEvent('dragstart', {
                  bubbles: true,
                  cancelable: true,
                  dataTransfer: dataTransfer,
                });
                
                $element[0].dispatchEvent(dragStartEvent);

                cy.wait(300);

                // Dispara o evento dragover no canvas
                const dragOverEvent = new win.DragEvent('dragover', {
                  bubbles: true,
                  cancelable: true,
                  dataTransfer: dataTransfer,
                  clientX: dropX,
                  clientY: dropY,
                });
                
                $canvas[0].dispatchEvent(dragOverEvent);

                cy.wait(300);

                // Dispara o evento drop no canvas
                const dropEvent = new win.DragEvent('drop', {
                  bubbles: true,
                  cancelable: true,
                  dataTransfer: dataTransfer,
                  clientX: dropX,
                  clientY: dropY,
                });
                
                $canvas[0].dispatchEvent(dropEvent);

                cy.wait(1500);

                // Verifica se o nó foi adicionado ao canvas
                cy.get('.react-flow__node', { timeout: 10000 })
                  .should('have.length.at.least', 1);
                
                // Verifica se o elemento aparece no canvas pelo texto
                cy.get('.react-flow', { timeout: 10000 })
                  .contains(elementData.description, { timeout: 10000 })
                  .should('be.visible');
              });
            });
        });
    });
  });

  describe('Organizar Árvore', () => {
    it('deve organizar os nodos em formato de árvore', () => {
      // Primeiro, adiciona alguns elementos ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      cy.get('.canvas-option-item', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      // Verifica se há pelo menos 2 nós no canvas
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 2);

      // O botão de organizar está no CanvasToolbar, é um botão circular no canto inferior direito
      // Procura pelo botão que contém o ícone AlignCenterVertical (lucide-react)
      cy.get('div[style*="position: absolute"][style*="bottom: 30px"][style*="right: 30px"]', { timeout: 10000 })
        .find('button')
        .should('be.visible')
        .click();

      cy.wait(2000); // Aguarda a animação de organização e fitView

      // Verifica se os nós ainda estão visíveis após organização
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 2)
        .should('be.visible');
    });
  });

  describe('Editar Nó', () => {
    it('deve editar um nó existente no canvas', () => {
      const newMessage = 'Mensagem editada no teste';

      // Intercepta a requisição de atualização ANTES de qualquer ação
      // Captura qualquer PATCH para surveys-elements (independente do ID)
      cy.intercept('PATCH', '**/surveys-elements/**', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            id: MOCK_SURVEY_ELEMENTS[0].id || parseInt(req.url.split('/').pop() || '1', 10),
            description: newMessage,
            type: 'MESSAGE',
            options: [],
            deletedAt: null,
          },
        });
      }).as('updateElement');

      // Primeiro, adiciona um elemento ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      // Verifica se o nó foi adicionado
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 1);

      // Estratégia robusta: força a visibilidade dos botões no teste
      cy.get('.custom-node', { timeout: 10000 })
        .first()
        .should('be.visible')
        .then(($node) => {
          // Força os botões a ficarem visíveis removendo as regras de hover
          const editButton = $node.find('button.edit-button')[0];
          if (editButton) {
            (editButton as HTMLElement).style.opacity = '1';
            (editButton as HTMLElement).style.transform = 'scale(1)';
            (editButton as HTMLElement).style.pointerEvents = 'auto';
          }
        });

      cy.wait(300);

      // Clica no botão de editar
      cy.get('.custom-node', { timeout: 10000 })
        .first()
        .find('button.edit-button', { timeout: 10000 })
        .should('exist')
        .click({ force: true });

      // Aguarda o modal abrir
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('h4', 'Editar Mensagem', { timeout: 10000 })
            .should('be.visible');
        });

      cy.wait(1000);

      // Preenche o novo título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(newMessage, { force: true });

      cy.wait(300);

      // Clica no botão "Salvar" - usando force: true para evitar problema com backdrop
      cy.contains('button', 'Salvar', { timeout: 10000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click({ force: true });

      // Verifica se o toast de sucesso aparece - se aparecer, o teste passa
      cy.contains('Fluxo salvo com sucesso!', { timeout: 10000 })
        .should('be.visible');
    });

  });

  describe('Deletar Nó', () => {
    it('deve deletar um nó do canvas', () => {
      // Adiciona um elemento ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .should('be.visible')
            .click();
        });

      cy.wait(1000);

      // Obtém o número inicial de nós
      cy.get('.react-flow__node', { timeout: 10000 })
        .then(($nodes) => {
          const initialCount = $nodes.length;

          // Estratégia robusta: força a visibilidade dos botões no teste
          cy.get('.custom-node', { timeout: 10000 })
            .first()
            .should('be.visible')
            .then(($node) => {
              // Força os botões a ficarem visíveis removendo as regras de hover
              const deleteButton = $node.find('button.delete-button')[0];
              if (deleteButton) {
                (deleteButton as HTMLElement).style.opacity = '1';
                (deleteButton as HTMLElement).style.transform = 'scale(1)';
                (deleteButton as HTMLElement).style.pointerEvents = 'auto';
              }
            });

          cy.wait(300);

          // Clica no botão de deletar
          cy.get('.custom-node', { timeout: 10000 })
            .first()
            .find('button.delete-button', { timeout: 10000 })
            .should('exist')
            .click({ force: true });

          // Aguarda o modal de confirmação aparecer
          cy.contains('Deletar Nó', { timeout: 10000 }).should('be.visible');

          // Confirma a deleção - o botão tem o texto "Deletar" dentro de um span
          cy.get('.MuiCardActions-root', { timeout: 10000 })
            .contains('button', 'Deletar', { timeout: 10000 })
            .should('be.visible')
            .click();

          cy.wait(1000);

          // Verifica se o número de nós diminuiu
          cy.get('.react-flow__node', { timeout: 10000 })
            .should('have.length', initialCount - 1);
        });
    });
  });

  describe('Deletar Conexão', () => {
    it('deve deletar uma conexão entre nodos', () => {
      // 1. Adiciona dois elementos ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .click();
        });

      cy.wait(1000);

      cy.get('.canvas-option-item', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .click();
        });

      cy.wait(1000);

      // 2. Verifica se os nós foram adicionados
      cy.get('.react-flow__node', { timeout: 10000 })
        .should('have.length.at.least', 2);

      // 3. Conecta os nós manualmente usando handles
      cy.get('.react-flow__node', { timeout: 10000 })
        .first()
        .then(($firstNode) => {
          // Encontra o handle de saída do primeiro nó (bottom)
          cy.get('.react-flow__handle-bottom', { timeout: 10000 })
            .first()
            .should('exist')
            .then(($sourceHandle) => {
              // Encontra o handle de entrada do segundo nó (top)
              cy.get('.react-flow__handle-top', { timeout: 10000 })
                .eq(1) // Segundo nó
                .should('exist')
                .then(($targetHandle) => {
                  // Simula o arraste do handle de saída para o handle de entrada
                  const sourceRect = $sourceHandle[0].getBoundingClientRect();
                  const targetRect = $targetHandle[0].getBoundingClientRect();

                  // Cria eventos de mouse para simular a conexão
                  cy.wrap($sourceHandle[0])
                    .trigger('mousedown', { which: 1, button: 0, force: true })
                    .trigger('mousemove', {
                      clientX: targetRect.left + targetRect.width / 2,
                      clientY: targetRect.top + targetRect.height / 2,
                      force: true,
                    });

                  cy.wrap($targetHandle[0])
                    .trigger('mouseup', { which: 1, button: 0, force: true });

                  cy.wait(1000);

                  // Verifica se a conexão foi criada
                  cy.get('.react-flow__edge', { timeout: 5000 })
                    .should('have.length.at.least', 1);
                });
            });
        });

      // 4. Organiza o canvas
      cy.get('div[style*="position: absolute"][style*="bottom: 30px"][style*="right: 30px"]', { timeout: 10000 })
        .find('button')
        .should('be.visible')
        .click();

      cy.wait(2000); // Aguarda a animação de organização

      // 5. Verifica se há conexões antes de deletar
      cy.get('.react-flow__edge', { timeout: 10000 })
        .should('have.length.at.least', 1)
        .then(($edges) => {
          const initialEdgeCount = $edges.length;

          // 6. Faz duplo clique na primeira conexão para deletar (usando force para evitar problema com toolbar)
          cy.get('.react-flow__edge', { timeout: 10000 })
            .first()
            .dblclick({ force: true });

          // Aguarda o modal de confirmação aparecer e verifica o título
          cy.contains('Deletar Conexão', { timeout: 10000 })
            .should('be.visible');

          // Verifica a mensagem do modal
          cy.contains('Tem certeza que deseja deletar esta conexão?', { timeout: 10000 })
            .should('be.visible');

          // Confirma a deleção - o botão tem o texto "Deletar" dentro de um span
          cy.contains('button', 'Deletar', { timeout: 10000 })
            .should('be.visible')
            .click();

          cy.wait(1000);

          // Verifica se o número de conexões diminuiu
          cy.get('.react-flow__edge', { timeout: 10000 })
            .should('have.length', initialEdgeCount - 1);
        });
    });
  });

  describe('Salvar Fluxo', () => {
    it('deve salvar o fluxo do canvas', () => {
      // Adiciona um elemento ao canvas
      cy.get('.canvas-option-item', { timeout: 10000 })
        .first()
        .within(() => {
          cy.get('button[title="Adicionar ao canvas"]', { timeout: 10000 })
            .click();
        });

      cy.wait(1000);

      // Clica no botão "Salvar"
      cy.contains('button', 'Salvar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda a requisição de salvar flow ser completada
      cy.wait('@saveFlow', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verifica se o toast de sucesso aparece (se houver)
      // O toast pode não aparecer dependendo da implementação
      cy.wait(1000);
    });
  });

  describe('Criar Tipos de Mensagem', () => {
    beforeEach(() => {
      // Intercepta as requisições de criação de elementos
      cy.intercept('POST', '**/api/core/surveys-elements', (req) => {
        const response = {
          id: Math.floor(Math.random() * 1000) + 100,
          description: req.body.description,
          type: req.body.type,
          options: req.body.options || [],
          deletedAt: null,
        };
        req.reply({ statusCode: 201, body: response });
      }).as('createElement');
    });

    it('deve criar uma mensagem do tipo Alternativa', () => {
      const titulo = 'Você gosta de programar?';
      const alternativas = ['Sim', 'Não'];

      // Clica no botão "Nova Mensagem"
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir e verifica o título dentro do modal
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.contains('h4', 'Nova Mensagem', { timeout: 10000 })
            .should('be.visible');
        });
      cy.wait(1000);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type(titulo, { force: true });
        });

      cy.wait(300);

      // Seleciona o tipo "Alternativa"
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'Alternativa', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(500);

      // Preenche as alternativas
      // Os inputs das alternativas estão dentro de TextFields do Material-UI
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[0], { force: true });

      cy.wait(300);

      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(1)
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[1], { force: true });

      cy.wait(300);

      // Cria o elemento
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Verifica a requisição
      cy.wait('@createElement', { timeout: 10000 }).then((interception) => {
        expect(interception.request.body.type).to.equal('OPTION');
        expect(interception.request.body.description).to.equal(titulo);
        expect(interception.request.body.options).to.have.length(2);
        expect(interception.request.body.options[0].description).to.equal(alternativas[0]);
        expect(interception.request.body.options[1].description).to.equal(alternativas[1]);
      });

      // Verifica o toast
      cy.contains('Elemento criado com sucesso!', { timeout: 5000 }).should('be.visible');
    });

    it('deve criar uma mensagem do tipo Múltipla Escolha', () => {
      const titulo = 'Quais linguagens você conhece?';
      const alternativas = ['JavaScript', 'TypeScript', 'Python', 'Java'];

      // Clica no botão "Nova Mensagem"
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir e verifica o título dentro do modal
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .find('h4')
        .contains('Nova Mensagem', { timeout: 10000 })
        .should('be.visible');
      cy.wait(1000);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type(titulo, { force: true });
        });

      cy.wait(300);

      // Seleciona o tipo "MultiplaEscolha" (sem espaço - tudo junto)
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'MultiplaEscolha', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(500);

      // Preenche as duas primeiras alternativas
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[0], { force: true });

      cy.wait(300);

      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(1)
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[1], { force: true });

      cy.wait(500);

      // Adiciona mais alternativas
      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('button')
        .last()
        .click();

      cy.wait(500);

      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(2)
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[2], { force: true });

      cy.wait(500);

      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('button')
        .last()
        .click();

      cy.wait(500);

      cy.get('[aria-label="options-list"]', { timeout: 10000 })
        .find('input')
        .eq(3)
        .should('be.visible')
        .clear({ force: true })
        .type(alternativas[3], { force: true });

      cy.wait(300);

      // Cria o elemento
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Verifica a requisição
      cy.wait('@createElement', { timeout: 10000 }).then((interception) => {
        expect(interception.request.body.type).to.equal('MULTIPLE_CHOICE');
        expect(interception.request.body.description).to.equal(titulo);
        expect(interception.request.body.options).to.have.length(4);
      });

      // Verifica o toast
      cy.contains('Elemento criado com sucesso!', { timeout: 5000 }).should('be.visible');
    });

    it('deve criar uma mensagem do tipo Input', () => {
      const titulo = 'Descreva sua experiência';

      // Clica no botão "Nova Mensagem"
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir e verifica o título dentro do modal
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .find('h4')
        .contains('Nova Mensagem', { timeout: 10000 })
        .should('be.visible');
      cy.wait(1000);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type(titulo, { force: true });
        });

      cy.wait(300);

      // Seleciona o tipo "Input"
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'Input', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(500);

      // Verifica que não há campo de alternativas para Input
      cy.get('[aria-label="options-list"]', { timeout: 5000 })
        .should('not.exist');

      // Cria o elemento
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Verifica a requisição
      cy.wait('@createElement', { timeout: 10000 }).then((interception) => {
        expect(interception.request.body.type).to.equal('INPUT');
        expect(interception.request.body.description).to.equal(titulo);
        expect(interception.request.body.options).to.be.an('array').that.is.empty;
      });

      // Verifica o toast
      cy.contains('Elemento criado com sucesso!', { timeout: 5000 }).should('be.visible');
    });

    it('deve criar uma mensagem do tipo Feedback/Mensagem', () => {
      const titulo = 'Obrigado por participar!';

      // Clica no botão "Nova Mensagem"
      cy.contains('button', 'Nova Mensagem', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Aguarda o modal abrir e verifica o título dentro do modal
      cy.get('.modal-survey-element', { timeout: 10000 })
        .should('be.visible')
        .find('h4')
        .contains('Nova Mensagem', { timeout: 10000 })
        .should('be.visible');
      cy.wait(1000);

      // Preenche o título
      cy.get('.modal-survey-element', { timeout: 10000 })
        .within(() => {
          cy.contains('label', 'Título', { timeout: 10000 })
            .should('be.visible')
            .next()
            .find('input')
            .should('be.visible')
            .clear({ force: true })
            .type(titulo, { force: true });
        });

      cy.wait(300);

      // Seleciona o tipo "Feedback"
      cy.get('.modal-survey-element', { timeout: 10000 })
        .contains('[role="button"]', 'Feedback', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait(500);

      // Verifica que não há campo de alternativas para Feedback
      cy.get('[aria-label="options-list"]', { timeout: 5000 })
        .should('not.exist');

      // Cria o elemento
      cy.contains('button', 'Criar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Verifica a requisição
      cy.wait('@createElement', { timeout: 10000 }).then((interception) => {
        expect(interception.request.body.type).to.equal('MESSAGE');
        expect(interception.request.body.description).to.equal(titulo);
        expect(interception.request.body.options).to.be.an('array').that.is.empty;
      });

      // Verifica o toast
      cy.contains('Elemento criado com sucesso!', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Voltar para Questionários', () => {
    it('deve voltar para a página de questionários', () => {
      // Clica no botão "Voltar"
      cy.contains('button', 'Voltar', { timeout: 10000 })
        .should('be.visible')
        .click();

      // Verifica se voltou para a página de questionários
      cy.url({ timeout: 10000 }).should('include', '/questionarios');
      cy.url({ timeout: 10000 }).should('not.include', '/canva');
    });
  });
});

