import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    // Reduz timeouts para tornar os testes mais rápidos
    defaultCommandTimeout: 3000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    pageLoadTimeout: 10000,
    // Reduz tempo de espera entre comandos
    execTimeout: 5000,
    taskTimeout: 5000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // Ativa vídeo
  video: true,
  videoCompression: 32, // Compressão do vídeo (0-51, menor = melhor qualidade mas maior arquivo)
  videosFolder: 'cypress/videos',
  screenshotOnRunFailure: true,
  // Configurações para melhorar performance
  numTestsKeptInMemory: 0, // Não mantém testes na memória (mais rápido, mas menos informações de debug)
  watchForFileChanges: false, // Desativa watch em modo run
});
