# ⚡ PRÓXIMAS AÇÕES IMEDIATAS (HOJE)

**Prioridade:** CRÍTICA  
**Tempo Estimado:** 4-5 horas  
**Deadline:** Ainda hoje

---

## 🚨 AÇÕES CRÍTICAS (ANTES DE QUALQUER COISA)

### 1. RECRIAR CHAVES SUPABASE (30 minutos)

**⚠️ SEGURANÇA - FAZER AGORA**

As chaves foram expostas no repositório público. Qualquer pessoa com este link pode acessar seu banco de dados!

**Passo a Passo:**

1. Ir para: https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Em "API Keys", clicar no ícone de "refresh" ou "Create new key"
3. Copiar **NOVO** ANON_KEY e SERVICE_ROLE_KEY
4. Atualizar `.env.local` com as novas chaves

```bash
# .env.local (NOVO)
NEXT_PUBLIC_SUPABASE_URL=https://dhvujedotuiazbseughf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ....[NOVA]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ....[NOVA]
```

5. Fazer commit SEM .env.local
6. Informar à equipe que as chaves foram atualizadas

---

### 2. CORRIGIR .GITIGNORE (5 minutos)

```bash
# Adicionar ao .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
echo "dist/" >> .gitignore
echo ".next/" >> .gitignore
```

Commit:
```bash
git add .gitignore
git commit -m "chore: adicionar chaves ao gitignore"
```

---

### 3. CORRIGIR ERRO DO BUILD (1 hora)

**Erro:** Turbopack falha na linha 182 de `/loans/new/page.tsx`

**Investigação:**

```bash
npm run build 2>&1 | head -100
```

**Se der erro, revisar:**
1. Linha 182 e ao redor dela
2. Procurar por: 
   - Tags JSX não fechadas `<>`
   - Props inválidas
   - Sintaxe de TypeScript errada
   - Strings sem aspas

**Teste rápido:**
```bash
# Compilar apenas esse arquivo
npx tsc src/app/\(dashboard\)/loans/new/page.tsx --noEmit
```

---

### 4. INSTALAR COMPONENTES SHADCN (15 minutos)

```bash
# Instalar componentes faltantes
npx shadcn add sonner -y
npx shadcn add form -y
npx shadcn add select -y
npx shadcn add calendar -y
npx shadcn add table -y
npx shadcn add sheet -y

# Verificar instalação
ls src/components/ui/
```

---

### 5. CRIAR ARQUIVO DE TIPOS (30 minutos)

**Arquivo:** `src/types/database.ts`

Copiar todo conteúdo de `PLANO_ACAO_DETALHADO.md` seção "Completar Database Types"

```bash
# Verificar se compila
npx tsc src/types/database.ts --noEmit
```

---

## 📝 CHECKLIST DESTA TARDE

```
SEGURANÇA:
☐ Recriar chaves Supabase
☐ Atualizar .env.local
☐ Adicionar .env ao .gitignore
☐ Fazer commit com novas chaves

BUILD:
☐ Corrigir erro Turbopack (linha 182)
☐ npm run build passa sem erros
☐ npm run dev funciona

DEPENDÊNCIAS:
☐ Instalar componentes shadcn
☐ Criar types/database.ts
☐ npm install completa sem erros

DOCUMENTAÇÃO:
☐ Ler documentos criados em .kombai/
☐ Entender roadmap completo
```

---

## 📍 ESTRUTURA DE PASTAS RECOMENDADA

**Criar agora:**

```bash
# Design tokens
mkdir -p src/styles
touch src/styles/colors.ts
touch src/styles/typography.ts
touch src/styles/shadows.ts
touch src/styles/radius.ts
touch src/styles/spacing.ts

# Error handling
touch src/lib/error-handler.ts

# Hooks customizados
mkdir -p src/hooks
touch src/hooks/useNotifications.ts
touch src/hooks/useSearch.ts
touch src/hooks/useFormAutoSave.ts

# Componentes customizados
mkdir -p src/components/dashboard
mkdir -p src/components/forms
mkdir -p src/components/modals
mkdir -p src/components/cards
mkdir -p src/components/sections
mkdir -p src/components/empty-states
mkdir -p src/components/loaders

# Documentação
mkdir -p docs
touch docs/DESIGN_SYSTEM.md
touch docs/API.md
touch docs/GETTING_STARTED.md
```

---

## 🎯 SEGUNDA PRIORIDADE (SEMANA QUE VEM)

Se conseguir fazer hoje, ótimo! Se não, comece segunda:

- [ ] Criar design token system (colors.ts, typography.ts)
- [ ] Implementar error handler global
- [ ] Otimizar queries do sidebar (N+1)
- [ ] Começar redesign do header com brand colors

---

## 📞 SUPORTE & DÚVIDAS

Se ficar preso em algo:

1. **Erro de build?**
   - Ir para: https://nextjs.org/docs/messages/
   - Procurar pelo erro code

2. **Dúvida sobre shadcn?**
   - Ir para: https://ui.shadcn.com/

3. **Problema Supabase?**
   - Ir para: https://supabase.com/docs

4. **Tailwind dúvida?**
   - Ir para: https://tailwindcss.com/docs

---

## 📊 DEFINIÇÃO DE "PRONTO"

Ao final do dia, você terá:

✅ Build funcionando (sem erros)
✅ Componentes shadcn instalados
✅ Tipos TypeScript definidos
✅ Chaves Supabase atualizadas
✅ .env.local no .gitignore
✅ Entendimento claro do roadmap

---

## 🔄 APÓS COMPLETAR ESTA LISTA

1. Ler documento **DIAGNOSTICO_COMPLETO_SISTEMA.md**
2. Ler documento **PLANO_ACAO_DETALHADO.md** 
3. Ler documento **RECOMENDACOES_DESIGN_E_MARCA.md**
4. Planejar FASE 1 (Design Tokens + Error Handling)

---

## ✅ IMPORTANTE

**Não comece a "corrigir design" antes de:**
- ✅ Build estar funcionando
- ✅ Tipos TypeScript estar OK
- ✅ Segurança estar OK

**Ordem correta:**
1. Corrigir crítico (segurança, build)
2. Estrutura técnica (tipos, error handling)
3. Design e UX

---

**Tempo estimado: 4-5 horas**  
**Comece agora, relatar quando completado!**
