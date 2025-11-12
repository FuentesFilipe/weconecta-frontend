/// <reference types="cypress" />

// Comandos customizados do Cypress podem ser adicionados aqui
// Para mais informações: https://on.cypress.io/custom-commands

declare global {
  namespace Cypress {
    interface Chainable {
      // Adicione comandos customizados aqui quando necessário
    }
  }
}

export {};
