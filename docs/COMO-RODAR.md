# Como rodar o projeto

Este projeto usa:

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Auth.js

## 1. Pre-requisitos

Instale localmente:

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (ou um banco compativel acessivel pela `DATABASE_URL`)

## 2. Configurar variaveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com seus valores reais:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legislacao_digital?schema=public"
NEXTAUTH_SECRET="troque-por-um-segredo-forte"
NEXTAUTH_URL="http://localhost:3000"
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Preparar o banco

Gerar o client do Prisma:

```bash
npm run prisma:generate
```

Aplicar o schema no banco:

```bash
npm run db:push
```

Popular dados de exemplo:

```bash
npm run prisma:seed
```

## 5. Rodar em desenvolvimento

```bash
npm run dev
```

Se o Next ficar com cache quebrado e aparecer erro como `Cannot find module './859.js'`, suba limpo:

```bash
npm run dev:clean
```

Se a porta `3000` estiver ocupada ou presa por processo antigo:

```bash
npm run dev:3001
```

Ou, limpando cache e mudando a porta ao mesmo tempo:

```bash
npm run dev:clean:3001
```

Abra no navegador:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/piracicaba-sp](http://localhost:3000/piracicaba-sp)
- [http://localhost:3000/campinas-sp](http://localhost:3000/campinas-sp)

## 6. Comandos uteis

Rodar testes:

```bash
npm run test
```

Limpar cache local do Next:

```bash
npm run clean
```

Rodar lint:

```bash
npm run lint
```

Gerar build de producao:

```bash
npm run build
npm run start
```

## 7. Fluxo recomendado do zero

Se voce acabou de receber o projeto, a sequencia normal e:

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run prisma:seed
npm run dev
```

## 8. Observacoes

- O projeto foi pensado para funcionar com multi-tenant por slug.
- Cada cidade fica acessivel por uma rota como `/piracicaba-sp` ou `/campinas-sp`.
- O deploy pode ser feito em Vercel, Firebase App Hosting ou Cloud Run, desde que as variaveis de ambiente e o PostgreSQL estejam configurados.
