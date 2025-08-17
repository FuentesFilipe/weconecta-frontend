## Instalação do Node Version Manager

### Instalação windows

No windows, baixar a ultima versão por aqui https://github.com/coreybutler/nvm-windows/releases
Durante a instação, só permitir que o NVM controle as versões do Node que já estão instaladas.

### Instalação bash

No terminal executar:

- curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
- export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
- source ~/.bashrc

### Usando nvm

No terminal, nvm install 23, para instalar a versão 23 do node. Após isso, será necessário executar apenas nvm use 23.
Lembrando que o comando nvm use deverá sempre ser executado antes de rodar o projeto. Para evitar isso, poderá ser definida uma versão default
do node com o comando abaixo:

- nvm alias default 23

### Execução do projeto

No terminal, deve-se atualizar as dependencias através do comando:

- npm install

Para rodar o projeto local, deve-se executar o comando abaixo:

- npm run dev

## NextJs

### Documentação

https://nextjs.org/docs/app/api-reference/cli/create-next-app

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Commits

Os commits do projeto passam por verificação antes de sairem do local. Por isso, podem aparecer mensagens de erro ao tentar realizar commit. É importante
que a versão do node esteja atualizada e que o código, sendo commitado, esteja formatado. Isso pode ser verificado através do comando:

- npm run lint

Qualquer dúvida, é só clicar em 'show command output' e enviar um print do erro no discord.
