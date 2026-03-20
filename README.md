# Legislacao Digital

Portal de legislacao municipal multi-tenant / white-label construido com Next.js App Router, TypeScript, Tailwind CSS, Auth.js, Prisma e PostgreSQL.

O projeto foi desenhado para entregar uma experiencia melhor que o portal de referencia, com:

- home por municipio com branding proprio
- busca simples e avancada
- resultados com filtros por tenant
- detalhe da norma com resumo em linguagem simples
- area administrativa basica
- APIs REST organizadas
- camada de busca preparada para evoluir de PostgreSQL full-text para outro motor

## Demo local

Rotas publicas:

- `/piracicaba-sp`
- `/campinas-sp`

Rotas administrativas:

- `/admin/login`
- `/admin`

Contas demo:

- `admin@legislacaodigital.dev` / `admin123`
- `piracicaba@legislacaodigital.dev` / `piracicaba123`
- `campinas@legislacaodigital.dev` / `campinas123`

## Stack

- Next.js 14+ com App Router
- TypeScript
- Tailwind CSS
- componentes no estilo shadcn/ui
- lucide-react
- React Hook Form + Zod
- TanStack Query
- Auth.js
- Prisma
- PostgreSQL
- Vitest + Testing Library

## Arquitetura

### Multi-tenant

Cada municipio possui:

- slug proprio
- identidade visual
- homepage configuravel
- temas e normas proprias
- destaques, recentes e mais acessadas
- estatisticas independentes

O tenant e resolvido dinamicamente pela rota `/{tenant}` e por serviços dedicados em `server/tenants`.

### Camadas principais

- `app/`: rotas publicas, admin e APIs
- `components/`: UI reutilizavel
- `features/`: schemas e regras por area
- `server/`: dados, autenticacao e serviços
- `prisma/`: schema e seed
- `docs/`: guias operacionais e deploy
- `types/`: tipos do dominio

### Estrategia de dados

- Runtime da demo: camada em memoria com dados mockados para rodar imediatamente
- Persistencia de producao: Prisma + PostgreSQL via `prisma/schema.prisma`
- Busca: `server/search/search-service.ts`, isolando a implementacao atual para futura troca por Meilisearch, Typesense ou Elasticsearch

## APIs REST

Publicas:

- `GET /api/tenants`
- `GET /api/tenants/[slug]`
- `GET /api/[tenant]/norms`
- `GET /api/[tenant]/norms/[id]`
- `GET /api/[tenant]/search`
- `GET /api/[tenant]/themes`
- `GET /api/[tenant]/featured`
- `GET /api/[tenant]/favorites`
- `POST /api/[tenant]/favorites`

Admin:

- `POST /api/admin/tenants`
- `PATCH /api/admin/tenants/[id]`
- `POST /api/admin/[tenant]/norms`
- `PATCH /api/admin/[tenant]/norms/[id]`

## Como rodar

Leia:

- [docs/COMO-RODAR.md](/Users/home/Documents/teste%20codex/docs/COMO-RODAR.md)
- [docs/DEPLOY.md](/Users/home/Documents/teste%20codex/docs/DEPLOY.md)
- [docs/ALTERACOES-E-CONSOLIDACAO.md](/Users/home/Documents/teste%20codex/docs/ALTERACOES-E-CONSOLIDACAO.md)

Resumo rapido:

```bash
cp .env.example .env
npm install
npm run dev
```

Se quiser usar PostgreSQL + Prisma de fato:

```bash
npm run prisma:generate
npm run db:push
npm run prisma:seed
```

## Qualidade e evolucao

- tenant resolvido dinamicamente
- tema por tenant com CSS variables
- admin com auth basica e controle por papel
- versionamento simples de texto normativo com original, alteracoes e consolidado
- seed com Piracicaba-SP e Campinas-SP
- base pronta para evoluir para producao

## Status atual

Entregue nesta base:

- homepage multi-tenant
- busca guiada
- resultados
- detalhe de norma
- painel admin minimo
- schema Prisma
- seed script
- REST APIs
- documentacao de execucao e deploy
