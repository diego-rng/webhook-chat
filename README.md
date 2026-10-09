<!-- markdownlint-disable MD013 -->
# webhook-chat

Aplicação de chat usando Webhooks para conectar clientes e usando Frameworks do Deno.

## Histórico de Versões

| Version |    Date    |                   What Changed                    |
| :-----: | :--------: | ------------------------------------------------- |
|  0.1.0  | 2026-10-06 | README.md adaptado, base do projeto apresentada.  |
|  0.1.1  | 2026-10-07 | Adicionada interação entre clientes               |
|  0.1.2  | 2026-19-09 | Alterada a arquitetura do projeto                 |

## Sumário

- [Visão Geral](#visão-geral)
- [Features Planejadas](#features-planejadas)
- [Stack Técnico](#stack-técnico)
- [Arquitetura](#arquitetura)

## Visão Geral

Aplicação baseada em Next.js e TypeScript usando Webhooks e frameworks do Deno para conectar usuários.

## Features planejadas

| Feature                  | Uso                                        | Implementado? | Tempo Esperado para Implementação |
| ------------------------ | ------------------------------------------ | ------------- | --------------------------------- |
| Interação entre clientes | Permitir chat entre clientes               | Sim.          | 1 dia +-                          |
| Separação de conversas   | Separar conversas entre clientes           | Não           | 2 dias +-                         |
| Indicador de recebido    | Comunicar se a mensagem foi recebida       | Não.          | 1 dia +-                          |
| Grupos                   | Permitir chat entre múltiplos clientes     | Não.          | 3 dias +-                         |
| Autenticação             | Identificar usuários e guardar informações | Não.          | 3 dias +-                         |

## Stack Técnico

| Tecnologia   | Versão  | Uso                   |
| ------------ | ------- | --------------------- |
| Node.js      | 24.20.0 | Runtime JS            |
| Deno         | 2.9.7   | Runtime TS            |
| Next.js      | 16.3    | Framework principal   |
| TypeScript   | 5.9     | Tipagem estrita       |
| Tailwind CSS | 4.3.3   | Estilização           |
| Node WS      | 8.22.0  | Servidor de WebSocket |

Scripts Disponíveis:

```text
deno run dev
deno run lint
deno run server
```

## Arquitetura

O projeto segue *Feature-based Architecture*, focando em utilidades para o cliente ao invés de camadas técnicas.

```text
src/
├── app/
├── server/
├── shared/
│   ├── components/
│   └── utils/
└── features/
    └── web-socket/
         ├── api/
         ├── components/
         ├── hooks/
         ├── types/
         └── index.ts
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
# or
deno run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `app/page.tsx`. The page
auto-updates as you edit the file.

This project uses
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load [Geist](https://vercel.com/font), a new font
family for Vercel.
