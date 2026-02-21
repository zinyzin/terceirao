# 🐾 Turma Pantera — Sistema de Gestão Escolar

Sistema completo com **visão pública** (site aberto) e **área administrativa** protegida, com identidade visual de floresta noturna + pantera com olhos verdes.

---

## 🚀 Deploy no Railway (Passo a Passo)

### Pré-requisitos
- Conta no [Railway.app](https://railway.app)
- Git instalado

### 1. Suba o código para o GitHub
```bash
git init
git add .
git commit -m "🐾 Turma Pantera - initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/turma-pantera.git
git push -u origin main
```

### 2. Crie o Projeto no Railway
1. Entre em [railway.app](https://railway.app) → **New Project**
2. Selecione **Deploy from GitHub repo**
3. Conecte seu repositório

### 3. Adicione o Banco de Dados
1. No projeto Railway → **+ New** → **Database** → **PostgreSQL**
2. O Railway cria `DATABASE_URL` automaticamente

### 4. Configure o Backend
1. No Railway → **+ New** → **GitHub Repo** → selecione a pasta `backend`
   - Ou: **+ New** → **Empty Service** → configure o root directory como `/backend`
2. Vá em **Variables** e adicione:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=gere_com_openssl_rand_hex_64
JWT_REFRESH_SECRET=gere_com_openssl_rand_hex_64_diferente
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://SEU-FRONTEND.up.railway.app
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=SuaSenhaSegura@2024!
```

> 💡 Gere os secrets com: `openssl rand -hex 64`

### 5. Configure o Frontend
1. **+ New** → **GitHub Repo** → pasta `frontend`
2. Em **Variables**:
```env
# Nenhuma variável necessária no frontend!
# O Vite usa proxy em dev, em prod o nginx redireciona via URL relativa
```

3. Se o frontend precisar da URL da API explicitamente, adicione:
```env
VITE_API_URL=https://SEU-BACKEND.up.railway.app
```

E atualize `src/lib/api.js`:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  ...
})
```

### 6. Atualizar CORS no Backend
Após o deploy do frontend, pegue a URL e atualize `FRONTEND_URL` no backend.

### 7. Verificar
- Frontend: `https://SEU-FRONTEND.up.railway.app` → página pública com floresta
- Backend health: `https://SEU-BACKEND.up.railway.app/api/health`

---

## 🖥️ Desenvolvimento Local (Docker)

```bash
# Um único comando
docker-compose up --build

# Acesse:
# Frontend: http://localhost
# Backend:  http://localhost:3001
# API:      http://localhost:3001/api/health
```

## 🖥️ Desenvolvimento Local (Manual)

### Backend
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

### Frontend
```bash
cd frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## 🔐 Login

### Acesso à Área Admin
A área de login está **oculta** para visitantes. Para acessar:

1. **Opção 1:** Clique **3 vezes na pantera** no canto superior esquerdo
2. **Opção 2:** Clique no ícone de seta (→) no canto direito da navbar
3. **Opção 3:** Navegue direto para `/dash` (redireciona para login se não autenticado)

### Credenciais Padrão (Superadmin)
```
Usuário: superadmin
Senha:   Pantera@2024!
```
> ⚠️ **Altere imediatamente em produção!**

---

## 👥 Gerenciamento de Usuários

O **Superadmin** pode criar admins com usuário e senha totalmente personalizados:

1. Faça login como superadmin
2. Acesse **Usuários** no menu lateral
3. Clique em **"Novo Admin"**
4. Defina:
   - **Nome completo**
   - **Usuário** (ex: `maria_admin`) — usado no login
   - **Senha** (mínimo 6 caracteres)
   - **Nível**: Admin ou Superadmin

O admin criado pode fazer login com as credenciais definidas por você.

---

## 📁 Estrutura do Projeto

```
turma-pantera/
├── backend/
│   ├── prisma/schema.prisma     # Banco de dados
│   ├── src/
│   │   ├── index.js             # Entry point
│   │   ├── seed.js              # Cria superadmin e dados iniciais
│   │   ├── lib/                 # Prisma, JWT, Logger
│   │   ├── middleware/          # Auth, Errors
│   │   └── routes/              # API routes
│   ├── Dockerfile
│   ├── railway.json
│   └── .env.example
│
├── frontend/
│   ├── public/bg.jpg            # Imagem de fundo (floresta/pantera)
│   ├── src/
│   │   ├── App.jsx              # Router principal
│   │   ├── components/          # Sidebar, Modal, Panther, ForestBg
│   │   ├── pages/               # PublicPage, DashPage, UsersPage...
│   │   ├── store/               # Zustand auth store
│   │   └── lib/                 # Axios client
│   ├── Dockerfile
│   ├── nginx.conf
│   └── railway.json
│
├── docker-compose.yml           # Dev local completo
└── README.md
```

---

## 🌐 Páginas Públicas (sem login)

| Rota | Descrição |
|------|-----------|
| `/` | Página pública — stats, alunos, rifas abertas |

## 🔒 Páginas Administrativas (login obrigatório)

| Rota | Acesso |
|------|--------|
| `/dash` | Dashboard analítico |
| `/students` | Gestão de alunos |
| `/contributors` | Contribuidores externos |
| `/finance` | Financeiro (ledger imutável) |
| `/products` | Produtos e vendas |
| `/raffles` | Rifas e sorteios auditáveis |
| `/users` | **Superadmin:** Criar/gerenciar admins |
| `/audit` | **Superadmin:** Log de auditoria |

---

## 🔧 Variáveis de Ambiente

### Backend
| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | URL PostgreSQL | ✅ |
| `JWT_ACCESS_SECRET` | Secret JWT (mín. 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Secret JWT refresh (mín. 32 chars) | ✅ |
| `NODE_ENV` | `production` ou `development` | ✅ |
| `FRONTEND_URL` | URL do frontend (CORS) | ✅ |
| `SUPERADMIN_USERNAME` | Usuário do superadmin inicial | Opcional |
| `SUPERADMIN_PASSWORD` | Senha do superadmin inicial | Opcional |

---

## 🎨 Identidade Visual

- **Fundo:** Imagem da floresta noturna com pantera de olhos verdes
- **Pantera SVG:** Mascote animado com olhos brilhantes, respiração suave
- **Partículas:** Vaga-lumes flutuantes animados
- **Parallax:** Fundo se move sutilmente com o mouse
- **Glassmorphism:** Cards com vidro fosco verde-escuro
- **Fontes:** Cinzel (display) + Nunito (body)
- **Cores:** Verde neon (#00ff88) + verde floresta escuro

---

## 🔒 Segurança

- JWT Access Token (15 min) + Refresh Token rotativo (7 dias)
- Cookies HttpOnly + Secure em produção
- Sessões persistidas no banco com revogação global
- bcrypt (rounds 12) para senhas
- Rate limiting: 200 req/15min geral, 15 req/15min no login
- Helmet.js para headers de segurança
- Validação Zod em todos os endpoints
- Sorteios com `crypto.randomInt` + hash SHA256 auditável

---

## 📞 Suporte

Problemas? Verifique:
1. `DATABASE_URL` está correta no Railway
2. Prisma migrate rodou (`npx prisma migrate deploy`)
3. Seed executou (cria o superadmin)
4. `FRONTEND_URL` no backend bate com a URL do frontend deployado
