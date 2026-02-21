# Turma Pantera — Sistema de Gestão Escolar

Sistema web completo para gestão de turma escolar, com **página pública** aberta e **área administrativa** protegida por autenticação JWT. Identidade visual temática de floresta noturna com pantera.

---

## Funcionalidades

### Página Pública (sem login)
- Exibição de estatísticas gerais da turma
- Perfil dos alunos com foto e descrição
- Listagem de rifas abertas com participantes

### Área Administrativa (login obrigatório)

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral com gráficos e métricas em tempo real |
| **Alunos** | Cadastro, edição, foto e status dos alunos |
| **Contribuidores** | Registro de contribuidores externos com contato |
| **Financeiro** | Ledger imutável de entradas e saídas por aluno |
| **Produtos** | Catálogo de produtos e registro de vendas |
| **Rifas** | Criação e sorteio auditável com hash SHA256 |
| **Usuários** | *(Superadmin)* Criação e gestão de admins |
| **Auditoria** | *(Superadmin)* Log completo de ações no sistema |

### Acesso à Área Admin
O login está oculto para visitantes. Para acessar:
- Clique **3 vezes na pantera** no canto superior esquerdo
- Clique no ícone de seta (→) no canto direito da navbar
- Navegue diretamente para `/dash` (redireciona para login se não autenticado)

---

## Stack Tecnológica

### Backend
- **Node.js** + **Express** — API REST
- **Prisma ORM** + **PostgreSQL** — banco de dados relacional
- **JWT** (access 15min + refresh rotativo 7 dias) em cookies HttpOnly
- **bcrypt** (rounds 12), **Helmet**, **Zod**, **Winston**, **Rate Limiting**

### Frontend
- **React 18** + **Vite** — SPA moderna
- **TailwindCSS** — estilização utilitária
- **Zustand** — gerenciamento de estado de autenticação
- **React Router v6** — roteamento com guards por role
- **Recharts** — gráficos do dashboard
- **Framer Motion** — animações
- **Nginx** — servidor estático em produção

---

## Estrutura do Repositório

```
terceirao/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Modelos do banco de dados
│   ├── src/
│   │   ├── index.js             # Entry point da API
│   │   ├── seed.js              # Seed inicial (superadmin)
│   │   ├── lib/                 # Prisma client, JWT, Logger
│   │   ├── middleware/          # Autenticação, tratamento de erros
│   │   └── routes/              # auth, students, finance, raffles...
│   ├── uploads/                 # Fotos de alunos e rifas (gitignored)
│   ├── .env.example             # Variáveis de ambiente necessárias
│   ├── Dockerfile
│   └── railway.json
│
├── frontend/
│   ├── public/
│   │   └── bg.jpg               # Imagem de fundo (floresta/pantera)
│   ├── src/
│   │   ├── App.jsx              # Router principal com guards
│   │   ├── components/          # Sidebar, Modal, Panther, ForestBg
│   │   ├── pages/               # Uma página por módulo
│   │   ├── store/               # Zustand auth store
│   │   └── lib/                 # Axios client configurado
│   ├── nginx.conf               # Config nginx para produção
│   ├── Dockerfile
│   └── railway.json
│
├── docker-compose.yml           # Ambiente local completo (Postgres + backend + frontend)
├── railway.json                 # Config Railway para o backend (raiz)
├── .gitignore
└── README.md
```

---

## Desenvolvimento Local

### Com Docker (recomendado)

```bash
docker-compose up --build
```

| Serviço   | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost                 |
| Backend   | http://localhost:3001            |
| API Health| http://localhost:3001/api/health |

### Manual

**Backend:**
```bash
cd backend
cp .env.example .env
# Edite .env com sua DATABASE_URL local
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/seed.js
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## Deploy no Railway

### 1. Banco de Dados
No painel Railway → **+ New** → **Database** → **PostgreSQL**

### 2. Backend
**+ New** → **GitHub Repo** → defina **Root Directory** como `backend`

Variáveis de ambiente necessárias:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=          # openssl rand -hex 64
JWT_REFRESH_SECRET=         # openssl rand -hex 64 (diferente do anterior)
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://SEU-FRONTEND.up.railway.app
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=SuaSenhaSegura@2024!
```

### 3. Frontend
**+ New** → **GitHub Repo** → defina **Root Directory** como `frontend`

Nenhuma variável obrigatória. Se precisar apontar a API explicitamente:
```env
VITE_API_URL=https://SEU-BACKEND.up.railway.app
```

### 4. Após o deploy
Atualize `FRONTEND_URL` no backend com a URL real do frontend para liberar o CORS.

**Verificação:**
- Frontend: `https://SEU-FRONTEND.up.railway.app`
- Backend: `https://SEU-BACKEND.up.railway.app/api/health`

---

## Credenciais Padrão

```
Usuário: superadmin
Senha:   Pantera@2024!
```

> **Altere imediatamente em produção via variáveis de ambiente.**

---

## Segurança

- JWT Access Token (15 min) + Refresh Token rotativo (7 dias) em cookies HttpOnly/Secure
- Sessões persistidas no banco com suporte a revogação global
- bcrypt rounds 12 para hashing de senhas
- Rate limiting: 200 req/15min geral, 15 req/15min no login
- Helmet.js para headers HTTP de segurança
- Validação de entrada com Zod em todos os endpoints
- Sorteios com `crypto.randomInt` + hash SHA256 publicamente auditável
- Log de auditoria completo com IP, usuário e detalhes da ação

---

## Variáveis de Ambiente — Referência Completa

| Variável | Descrição | Obrigatório |
|----------|-----------|:-----------:|
| `DATABASE_URL` | URL de conexão PostgreSQL | ✅ |
| `JWT_ACCESS_SECRET` | Secret do access token (mín. 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Secret do refresh token (mín. 32 chars) | ✅ |
| `NODE_ENV` | `production` ou `development` | ✅ |
| `FRONTEND_URL` | URL do frontend para CORS | ✅ |
| `PORT` | Porta do servidor (padrão: 3001) | — |
| `SUPERADMIN_USERNAME` | Usuário do superadmin inicial | — |
| `SUPERADMIN_PASSWORD` | Senha do superadmin inicial | — |
