# Deploy

Este projeto foi estruturado para evitar acoplamento forte a um unico provedor.

## Variaveis de ambiente

Configure em qualquer plataforma:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://seu-dominio
```

## Vercel

Fluxo recomendado para entrega rapida de um app Next.js:

1. Suba o repositorio para GitHub.
2. Importe o projeto na Vercel.
3. Configure as variaveis de ambiente.
4. Aponte `DATABASE_URL` para um PostgreSQL gerenciado.
5. Rode `prisma generate` no build e `prisma db push` ou migracoes no pipeline de dados.

Sugestao de build:

```bash
npm install
npm run prisma:generate
npm run build
```

## Firebase App Hosting

Caminho gerenciado do Google para apps Next.js full-stack:

1. Conecte o repositorio ao Firebase App Hosting.
2. Configure as variaveis de ambiente no console.
3. Garanta acesso a um PostgreSQL externo ou gerenciado.
4. Execute Prisma generate durante o processo de build.

Notas:

- App Hosting e uma opcao adequada quando a prioridade e operacao gerenciada do app Next.js.
- O banco continua externo ao app e deve estar acessivel pela `DATABASE_URL`.

## Cloud Run

Opcao mais flexivel baseada em container:

1. Crie uma imagem Docker do app Next.js.
2. Publique no Artifact Registry.
3. Faça deploy no Cloud Run.
4. Configure `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`.
5. Garanta conectividade com o PostgreSQL.

Exemplo de estrategia:

- build do app com `npm run build`
- start com `npm run start`
- migrations ou `db:push` executadas em job separado

## Observacoes de arquitetura

- O runtime atual da demo usa fallback em memoria para facilitar validacao local.
- Em producao, a camada Prisma/PostgreSQL deve ser ligada aos repositories/servicos.
- A camada de busca foi separada para futura troca do mecanismo sem reescrever a UI.
