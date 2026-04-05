# Análise Completa — Turma Pantera

> Gerada em 05/04/2026 — Análise de toda a aplicação (backend + frontend + deploy)

---

## 🔴 BUGS CRÍTICOS

### 1. Sale sem relação Student no Prisma Schema
**Arquivo:** `backend/prisma/schema.prisma` (model Sale)  
**Problema:** O model `Sale` tem `studentId String?` mas **não declara** a relação `student Student?`. Rotas como `GET /api/products/:id/sales` usam `include: { student: ... }` que vai **crashar** em runtime.  
**Fix:** Adicionar `student Student? @relation(...)` no model Sale e `sales Sale[]` no model Student.

### 2. Dashboard calcula saldo errado (ignora REVERSAL)
**Arquivo:** `backend/src/routes/dashboard.js:68`  
**Problema:** `debits` filtra apenas `type: 'DEBIT'` mas ignora `'REVERSAL'`. O `finance.js:16` faz corretamente com `{ in: ['DEBIT', 'REVERSAL'] }`.  
**Impacto:** Saldo no dashboard fica inflado — estornos não são subtraídos.

### 3. Credenciais do superadmin hardcoded no Dockerfile
**Arquivo:** `Dockerfile:23-24`  
**Problema:** `SUPERADMIN_USERNAME=superadmin` e `SUPERADMIN_PASSWORD=Pantera@2024!` estão **no Dockerfile**, visíveis a qualquer pessoa com acesso à imagem Docker.  
**Fix:** Remover do Dockerfile e configurar via variáveis de ambiente no Railway.

### 4. Deletar contribuidor não limpa ledger entries
**Arquivo:** `backend/src/routes/contributors.js:45-50`  
**Problema:** Ao deletar um contribuidor, as doações são deletadas mas os `LedgerEntry` correspondentes (criados com `referenceType: 'DONATION'`) ficam **órfãos** no financeiro.  
**Impacto:** Saldo fica inconsistente.

### 5. Deletar produto não limpa ledger entries
**Arquivo:** `backend/src/routes/products.js:51-57`  
**Problema:** Sales são hard-deleted e produto soft-deleted, mas os `LedgerEntry` com `referenceType: 'PRODUCT'` permanecem.

---

## 🟡 BUGS MÉDIOS

### 6. EventsPage usa permissão errada
**Arquivo:** `frontend/src/pages/EventsPage.jsx:31`  
**Código:** `const isAllowed = isAuth && can('students:manage')`  
**Problema:** Deveria usar uma permissão própria de eventos (ex: `events:manage`). Atualmente, admins com permissão de alunos podem gerenciar eventos, mas admins sem essa permissão (mas com outras) não podem.

### 7. FinancePage load público sem try-catch
**Arquivo:** `frontend/src/pages/FinancePage.jsx:35-42`  
**Problema:** O branch `!isAllowed` faz `Promise.all` sem try-catch. Se a API falhar, o erro não é tratado.

### 8. GalleryPage upload sem try-catch
**Arquivo:** `frontend/src/pages/GalleryPage.jsx:31-42`  
**Problema:** `handleUpload` não tem tratamento de erro. Upload falhando exibe erro no console mas não notifica o usuário.

### 9. RafflesPage createRaffle/addParticipant sem try-catch
**Arquivo:** `frontend/src/pages/RafflesPage.jsx:43-53`  
**Problema:** Ambas funções não tem error handling. Erros de validação ou rede passam despercebidos.

### 10. Gallery POST com middleware duplicado
**Arquivo:** `backend/src/routes/gallery.js:39,64`  
**Problema:** `requireAdmin, requirePermission(...)` — ambos incluem `authenticate`. O middleware de autenticação roda 2x desnecessariamente.

### 11. `/api/public/info` fallback sem goalAmount
**Arquivo:** `backend/src/routes/public.js:80-93`  
**Problema:** O catch block retorna fallback sem `goalAmount`, causando progress bar vazia.

### 12. Cookie sameSite 'strict' pode causar problemas
**Arquivo:** `backend/src/routes/auth.js:42`  
**Problema:** `sameSite: 'strict'` impede envio do cookie ao navegar de links externos. Trocar para `'lax'` é mais seguro para UX.

---

## 🟢 BUGS MENORES

### 13. Wallet.balance nunca é atualizado
**Arquivo:** `backend/prisma/schema.prisma:109`  
**Problema:** O campo `balance Decimal @default(0)` existe mas nunca é escrito. O saldo é sempre calculado via aggregation de ledger entries. Campo morto.

### 14. Rate limiting agressivo
**Arquivo:** `backend/src/index.js:61-65`  
**Problema:** `max: 100` requests por 15min no `/api/`. Admin ativo pode facilmente atingir esse limite (cada page load faz 3-5 requests).

### 15. Dockerfile faltando diretórios de upload
**Arquivo:** `Dockerfile:41`  
**Problema:** `mkdir -p uploads/students uploads/raffles logs` — falta `uploads/teachers` e `uploads/gallery`. São criados pelo `index.js` em runtime, mas deveria ser consistente.

---

## 🔵 FUNCIONALIDADES FALTANTES

### Alta Prioridade
1. **Rota pública de eventos** — Não existe `/api/public/events`. Eventos só são visíveis para admins. Deveria haver uma visão pública do calendário.
2. **Editar contribuidor** — Não é possível alterar nome/email/telefone de um contribuidor existente.
3. **Editar produto** — Não existe PUT para atualizar nome/preço/descrição de produto.
4. **Cancelar rifa pela UI** — Backend tem `PATCH /:id/cancel` mas não há botão no frontend.
5. **Alterar senha própria** — Admins não conseguem mudar a própria senha. Só superadmin reseta.

### Média Prioridade
6. **Limpeza de sessões expiradas** — Sessions acumulam para sempre no banco. Precisa de cron/cleanup.
7. **Paginação nas páginas públicas** — Students, teachers, contributors não têm paginação. Pode ficar lento com muitos registros.
8. **Loading/feedback no upload da galeria** — Sem indicador visual durante upload de imagens.
9. **Página 404** — Catch-all redireciona para home em vez de mostrar uma página 404 informativa.
10. **Otimização de imagens** — Uploads são armazenados como-estão. Deveria usar sharp/imagemin para otimizar.

### Baixa Prioridade
11. **Toggle tema claro/escuro visível** — `useThemeStore` existe mas não há botão visível na UI.
12. **Export/backup do banco** — Sem mecanismo para exportar dados completos.
13. **Notificações de eventos** — Sem sistema para avisar sobre eventos próximos.
14. **Audit log na exclusão de contribuidores** — Falta registro no audit log.

---

## 📊 RESUMO

| Categoria | Quantidade |
|-----------|-----------|
| 🔴 Bugs Críticos | 5 |
| 🟡 Bugs Médios | 7 |
| 🟢 Bugs Menores | 3 |
| 🔵 Features Faltantes | 14 |
| **Total** | **29** |

---

## ✅ PONTOS POSITIVOS

- Arquitetura backend bem organizada com rotas separadas por domínio
- Middleware de auth robusto com refresh token rotation
- Zod validation em todas as rotas de escrita
- Audit logging nas operações críticas
- Sistema de permissões granular
- Soft-delete com lixeira e restauração
- Sorteio de rifas auditável com hash SHA-256
- Frontend responsivo com glassmorphism consistente
- Animações suaves com Framer Motion
- Toast/confirm customizados substituindo nativos
