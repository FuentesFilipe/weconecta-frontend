# Frontend - [Nome do Projeto]

Base do frontend do time, desenvolvido com [Next.js](https://nextjs.org/) (React + App Router).

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) (já incluído na instalação do Node)
- (Opcional) [VS Code](https://code.visualstudio.com/) + extensões para React/TS/ESLint/Prettier

> **OBS:**
> É **fortemente recomendado** utilizar **Linux** ou **[WSL2 no Windows](https://learn.microsoft.com/windows/wsl/install)** para trabalhar neste projeto.
>
> Em geral a DX é mais fluida em ambientes Unix-like devido a:
>
> - Maior compatibilidade com ferramentas e scripts de linha de comando
> - Instalação mais simples de dependências nativas e bibliotecas C/C++
> - Menos problemas com diferenças de paths (`/` vs `\`) e permissões de arquivos
> - Melhor integração com Docker e automações de build
>
> Caso seja realmente não queira utilizar Linux ou WSL 😔:
>
> - Utilize um terminal compatível com bash/zsh (Git Bash, PowerShell 7+)
> - Considere gerenciadores como [Chocolatey](https://chocolatey.org/) ou [Scoop](https://scoop.sh/)

## Instalação do projeto

Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd <nome-do-projeto-frontend>

pnpm install

```

## Executando o projeto

### Modo desenvolvimento

```bash
npm run dev
# ou: pnpm dev <----
```

A aplicação ficará disponível (por padrão) em http://localhost:3000

### Build de produção

```bash
npm run build
```

### Servir build de produção

```bash
npm run start
```

## Scripts úteis

```bash
npm run dev       # iniciar em desenvolvimento
npm run build     # gerar build de produção
npm run start     # servir build
npm run lint      # checar lint (ESLint)
npm run typecheck # checar tipos (se configurado com tsc)
```

## Dicas rápidas do Next.js

- **Rotas (App Router)**: arquivos em `app/` definem rotas automaticamente. Ex.: `app/page.tsx` → `/`, `app/dashboard/page.tsx` → `/dashboard`
- **Variáveis de ambiente**: use `.env.local` (NÃO COMMITAR PLS). Prefixo `NEXT_PUBLIC_` para expor no client
- **Imagens**: prefira `<Image />` de `next/image` para otimização automática

## Links úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Configuração de ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [Ambientes e variáveis](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js CLI](https://nextjs.org/docs/app/api-reference/next-cli)

---
