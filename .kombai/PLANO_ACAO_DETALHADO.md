# 📋 PLANO DE AÇÃO DETALHADO - MELHORIAS DO SISTEMA

**Status:** Pronto para Implementação  
**Começar em:** Hoje (18/02/2026)

---

## ⚡ FASE 1 - CORREÇÕES CRÍTICAS (20h)

### 1️⃣ Corrigir Erro Turbopack Build (2h)

**Problema:** Linha 182 do arquivo `/loans/new/page.tsx`

**Ação:**
```bash
# 1. Verificar sintaxe
cd MicrocreditoSaas
npm run build 2>&1 | grep -A5 "loans/new"

# 2. Revisar linha 182 e contexto
code src/app/\(dashboard\)/loans/new/page.tsx:180-190

# 3. Corrigir fechamentos faltantes de Tags JSX
# 4. Testar build local
npm run build
```

**Checklist:**
- [ ] Build passa sem erros
- [ ] npm run dev funciona
- [ ] Nenhum aviso de Turbopack

---

### 2️⃣ Completar Database Types (4h)

**Localização:** `src/types/database.ts`

**Adicionar tipos para:**

```typescript
// src/types/database.ts (completar arquivo)

export interface Institution {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  nuit?: string | null
  logo_url?: string | null
  website?: string | null
  primary_color?: string | null
  number_of_employees?: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string | null
  role_id: string
  institution_id?: string | null
  avatar_url?: string | null
  phone?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  institution_id: string
  full_name: string
  email?: string | null
  phone?: string | null
  nuit?: string | null
  address?: string | null
  occupation?: string | null
  marital_status?: string | null
  monthly_income?: number | null
  spouse_name?: string | null
  spouse_nuit?: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  institution_id: string
  client_id: string
  amount: number
  interest_rate: number
  term: number
  frequency: string
  interest_type: string
  status: 'pending' | 'approved' | 'active' | 'paid' | 'defaulted'
  disbursement_date?: string | null
  maturity_date?: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  institution_id: string
  loan_id: string
  amount: number
  payment_date: string
  status: 'pending' | 'paid' | 'reversed'
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  institution_id: string
  name: string
  balance: number
  account_number?: string | null
  bank_name?: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  action_url?: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  changes?: Record<string, any> | null
  created_at: string
}
```

---

### 3️⃣ Instalar Componentes shadcn (1h)

```bash
# Instalar componentes faltantes
npx shadcn add sonner
npx shadcn add form
npx shadcn add select
npx shadcn add calendar
npx shadcn add table
npx shadcn add sheet
npx shadcn add dialog
npx shadcn add toast (nota: usar sonner em vez disso)

# Verificar que foram instalados
ls -la src/components/ui/
```

---

### 4️⃣ Resolver Problema de Segurança (1h)

**Problema:** `.env.local` com chaves expostas

```bash
# 1. Criar arquivo template
cp .env.local .env.example
# Remover valores reais
# Deixar apenas comentários

# 2. Adicionar ao .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
echo ".env" >> .gitignore

# 3. Recriar chaves Supabase
# Ir em: https://app.supabase.com/project/YOUR_PROJECT
# Ir em: Settings > API > Create new key
# Copiar novo ANON_KEY e SERVICE_KEY
# Atualizar .env.local

# 4. Revisar se já foi exposto no git
# Se sim, need to rotate keys immediately!
```

---

### 5️⃣ Criar Design Token System (6h)

**Localização:** Novos arquivos em `src/styles/`

```typescript
// src/styles/colors.ts
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',   // Base
    600: '#2563EB',   // Darker
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Secondary Brand Colors (Green)
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',   // Base
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
  
  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
}

// src/styles/typography.ts
export const typography = {
  styles: {
    h1: 'text-5xl font-black tracking-tight',
    h2: 'text-4xl font-bold tracking-tight',
    h3: 'text-3xl font-bold',
    h4: 'text-2xl font-bold',
    h5: 'text-xl font-bold',
    h6: 'text-lg font-bold',
    
    body: 'text-base font-normal',
    bodyMedium: 'text-base font-medium',
    bodySmall: 'text-sm font-normal',
    bodySmallMedium: 'text-sm font-medium',
    
    caption: 'text-xs font-normal',
    captionMedium: 'text-xs font-medium',
    
    overline: 'text-[10px] font-bold uppercase tracking-widest',
  },
  
  fontFamily: {
    sans: 'var(--font-inter)',
    heading: 'var(--font-sora)', // Adicionar Sora depois
  }
}

// src/styles/shadows.ts
export const shadows = {
  sm: 'box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': 'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

// src/styles/radius.ts
export const radius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem',  // 8px
  lg: '1rem',    // 16px (default)
  xl: '1.5rem',  // 24px
  '2xl': '2rem', // 32px (cards)
  '3xl': '2.5rem',
  full: '9999px',
}

// src/styles/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
}
```

**Importar no Tailwind:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: require('./src/styles/colors').colors,
      spacing: require('./src/styles/spacing').spacing,
      borderRadius: require('./src/styles/radius').radius,
      boxShadow: require('./src/styles/shadows').shadows,
    }
  }
}
```

---

### 6️⃣ Error Handling Global (4h)

**Criar arquivo:** `src/lib/error-handler.ts`

```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message)
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    }
  }
  
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Algo deu errado',
      statusCode: 500
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Algo deu errado',
    statusCode: 500
  }
}

export const toastError = (error: unknown) => {
  const { code, message } = handleError(error)
  console.error(`[${code}]`, message)
  // Usar sonner para mostrar toast
}
```

---

### 7️⃣ Otimizar Queries do Sidebar (3h)

**Problema:** N+1 queries no sidebar

**Antes:**
```typescript
// 3 queries separadas
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase.from('users').select('...').eq('id', user.id)
const { data: institution } = await supabase.from('institutions').select('...').eq('id', profile.institution_id)
```

**Depois:**
```typescript
// 1 query com join
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('users')
  .select('*, institution:institutions(...)')
  .eq('id', user.id)
  .single()
```

---

**Total Fase 1: 20 horas**  
**Deadline: 2-3 dias**

---

## 🎨 FASE 2 - DESIGN & UX (74h)

### 1️⃣ Landing Page + Hero Section (16h)

**Criar:** `src/app/page.tsx` (nova página pública)

```typescript
// Estrutura
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Features Showcase />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  )
}
```

**Componentes a Criar:**
- HeroSection com CTA buttons
- Features grid (6 features principais)
- How it works (3-4 steps)
- Pricing tiers
- Customer testimonials
- Footer com links

**Tempo:** 16h (design + implementação)

---

### 2️⃣ Dark Mode Completo (8h)

**Atividade:**
1. Revisar todos os `.dark:` classes necessários
2. Testar em todos os componentes
3. Adicionar toggle de tema no header
4. Usar `next-themes` package

```typescript
// Adicionar em Header
'use client'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
```

---

### 3️⃣ Mobile Responsiveness Full (12h)

**Checklist de Responsiveness:**
- [ ] Sidebar: Drawer em mobile
- [ ] Header: Otimizado para mobile
- [ ] Cards: Stack verticalmente em mobile
- [ ] Tabelas: Scroll horizontal ou accordion
- [ ] Gráficos: Redimensionar para mobile
- [ ] Formulários: Inputs full-width em mobile
- [ ] Modais: Drawer em mobile (altura dinâmica)
- [ ] Botões: Tamanho mínimo 48x48px

**Breakpoints:**
```css
/* Tailwind v3 padrão */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

### 4️⃣ Acessibilidade WCAG AA (10h)

**Checklist:**
- [ ] Contraste de cores (4.5:1 para texto normal, 3:1 para grande)
- [ ] ARIA labels em inputs
- [ ] Role attributes em componentes customizados
- [ ] Navegação por teclado (Tab, Enter, Escape)
- [ ] Foco visual em todos elementos interativos
- [ ] Alt text em todas imagens
- [ ] Sem dependência de cor apenas
- [ ] Texto alt para ícones decorativos

**Ferramenta:** axe DevTools para testar

---

### 5️⃣ Design System Documentation (8h)

**Criar:** `docs/DESIGN_SYSTEM.md`

Incluir:
- Color palette com uso
- Typography com exemplos
- Icons guide
- Button variants
- Card types
- Form patterns
- Animation standards
- Accessibility checklist

---

### 6️⃣ Iconografia Customizada (12h)

**Ações:**
1. Criar arquivo SVG customizado para logo
2. Criar ícones de domínio (microcrédito):
   - Loan icon
   - Client icon
   - Payment icon
   - Collateral icon
   - Report icon
3. Adicionar favicon

---

### 7️⃣ Tutorial & Onboarding (8h)

**Implementar com Shepherd.js:**

```typescript
// src/hooks/useOnboarding.ts
import Shepherd from 'shepherd.js'

export function useOnboarding() {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      classes: 'shadow-lg bg-purple-dark',
      scrollTo: true
    }
  })

  tour.addStep({
    id: 'dashboard-intro',
    title: 'Bem-vindo!',
    text: 'Este é seu painel principal. Aqui você verá um resumo de todos os seus empréstimos.',
    attachTo: {
      element: '[data-tour="main-content"]',
      on: 'bottom'
    }
  })

  return { tour }
}
```

---

**Total Fase 2: 74 horas**  
**Deadline: 2 semanas**

---

## 📈 FASE 3 - FUNCIONALIDADES (46h)

### 1️⃣ Busca Global Funcional (8h)

```typescript
// src/components/header.tsx - implementar SearchBox
'use client'
import { useSearch } from '@/hooks/useSearch'

export function SearchBox() {
  const { search, results, isLoading } = useSearch()
  
  return (
    <Popover>
      <Input placeholder="Buscar..." onChange={e => search(e.target.value)} />
      {results && (
        <PopoverContent>
          {results.loans?.map(loan => <SearchResult item={loan} />)}
          {results.clients?.map(client => <SearchResult item={client} />)}
          {results.payments?.map(payment => <SearchResult item={payment} />)}
        </PopoverContent>
      )}
    </Popover>
  )
}
```

---

### 2️⃣ Notificações Reais (6h)

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState([])
  
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          showNotificationToast(payload.new)
        }
      )
      .subscribe()
    
    return () => channel.unsubscribe()
  }, [userId])
  
  return notifications
}
```

---

### 3️⃣ Pricing Page (4h)

**Criar:** `src/app/pricing/page.tsx`

Mostrar 3 tiers:
- **Starter:** Para ONGs pequenas
- **Professional:** Para cooperativas
- **Enterprise:** Custom

---

### 4️⃣ Knowledge Base / Docs (12h)

**Criar documentação em:** `docs/` ou via Vercel Docs

Seções:
1. Getting Started
2. Criar Empréstimo (guia completo)
3. Gerenciar Clientes
4. Processar Pagamentos
5. Relatórios
6. FAQ

---

### 5️⃣ Analytics & Tracking (6h)

```typescript
// src/lib/analytics.ts
import { useEffect } from 'react'

export function useAnalytics() {
  useEffect(() => {
    // Usar Plausible ou PostHog
    window.plausible = window.plausible || function() {}
    
    window.plausible('pageview')
  }, [])
}
```

---

### 6️⃣ SEO Otimização (6h)

**Ações:**
- [ ] Adicionar metadata dinâmico via `generateMetadata`
- [ ] Criar `sitemap.xml`
- [ ] Criar `robots.txt`
- [ ] Adicionar schema.org estruturado
- [ ] Otimizar imagens

---

### 7️⃣ Auto-save em Formulários (4h)

```typescript
// src/hooks/useFormAutoSave.ts
import { useEffect, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

export function useFormAutoSave(key: string, delay = 3000) {
  const { watch } = useFormContext()
  const values = watch()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`form-${key}`, JSON.stringify(values))
      console.log('Form auto-saved')
    }, delay)
    
    return () => clearTimeout(timer)
  }, [values, key, delay])
}
```

---

**Total Fase 3: 46 horas**  
**Deadline: 1.5 semanas**

---

## 🧪 TESTES & DEPLOY (30h)

### Testes Unitários (12h)
```bash
# Instalar dependências
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Criar testes para:
# - lib/utils.ts
# - lib/error-handler.ts
# - hooks customizados
# - Componentes principais
```

### Testes E2E (8h)
```bash
# Instalar Playwright
npm install --save-dev @playwright/test

# Testes:
# - Login flow
# - Criar empréstimo
# - Processar pagamento
# - Gerar relatório
```

### Performance (5h)
```bash
# Lighthouse scores
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 90+
# - SEO: 90+

# Core Web Vitals
# - LCP: < 2.5s
# - FID: < 100ms
# - CLS: < 0.1
```

### Deploy (5h)
- [ ] Deploy em Vercel
- [ ] Configurar domínio
- [ ] Setup CI/CD GitHub Actions
- [ ] Backup automático Supabase
- [ ] Monitoring & Alerting

---

## 📊 TIMELINE GERAL

```
Semana 1 (25h):
├─ Seg-Ter: Fase 1 Crítica (20h)
└─ Qua-Sex: Início Fase 2 Design (5h)

Semana 2 (44h):
├─ Seg-Qua: Fase 2 Design (25h)
└─ Qua-Sex: Design + Início Fase 3 (19h)

Semana 3 (44h):
├─ Seg-Ter: Fase 3 Funcionalidades (24h)
└─ Qua-Sex: Testes + Ajustes (20h)

Semana 4 (30h):
└─ Testes Completos + Deploy
```

---

## ✅ CHECKLIST FINAL

Antes de apresentar para clientes:

- [ ] Build passa sem warnings
- [ ] Lighthouse 90+ em todos scores
- [ ] WCAG AA compliance testado
- [ ] Mobile responsivo em todos devices
- [ ] Dark mode funcional
- [ ] Zero console errors
- [ ] Performance otimizada (<2.5s LCP)
- [ ] Documentação completa
- [ ] Landing page funcional
- [ ] Onboarding completo
- [ ] Notificações em tempo real
- [ ] Busca funcional
- [ ] Backup/Recovery testado
- [ ] Suporte de email/chat funcional
- [ ] Analytics monitorando

---

**Fim do Plano de Ação**
