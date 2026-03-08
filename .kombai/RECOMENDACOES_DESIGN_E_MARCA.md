# 🎨 RECOMENDAÇÕES DE DESIGN E MARCA

**Objetivo:** Transformar sistema genérico em identidade visual profissional

---

## 1️⃣ IDENTIDADE VISUAL

### Logo & Branding

**Conceito Recomendado:**
```
MICROCRED
────────────
Ícone: Moeda + Mãos (representando empréstimo)
Cor: Azul #2563EB + Verde #10B981

Variações:
├─ Logo completo (com texto)
├─ Ícone apenas (para favicon, perfil)
├─ Logo horizontal (para header)
└─ Logo vertical (para sidebar)
```

**Recomendação:** Contratar designer no Upwork:
- Budget: $500-1000 USD
- Deliverables:
  - Logo em SVG
  - Brand guidelines
  - 5 ícones customizados
  - Favicon multiresoluções

---

### Paleta de Cores Oficial

```
PRIMARY (Azul Profissional)
#2563EB - Base (uso principal)
#1E40AF - Hover/Pressionado
#1D4ED8 - Active
#DBEAFE - Background light
#EFF6FF - Background very light

SECONDARY (Verde Confiança)
#10B981 - Base (sucessos, aprovações)
#059669 - Hover
#047857 - Active
#D1FAE5 - Background light
#ECFDF5 - Background very light

SEMANTIC
#EF4444 - Danger/Erro
#F59E0B - Warning/Atenção
#0EA5E9 - Info
#6366F1 - Interest/Destaque

NEUTRAL (Para texto e backgrounds)
#F8FAFC - Fundo (light mode)
#0F172A - Texto principal (dark mode)
#64748B - Texto secundário
#CBD5E1 - Borders
#1E293B - Fundo escuro (dark mode)
```

**Aplicação:**
```
Botão Principal: Primary Blue #2563EB
Botão Secundário: Green #10B981
Botão Destrutivo: Red #EF4444
Texto: #0F172A (light) / #F8FAFC (dark)
Fundos: #F8FAFC (light) / #0F172A (dark)
```

---

### Tipografia

**Recomendação:**

```
Headings (H1-H6): Sora (Google Fonts)
- H1: 48px, bold, tracking +0.5%
- H2: 36px, bold, tracking +0.3%
- H3: 28px, bold
- H4: 20px, bold
- H5: 18px, semibold
- H6: 16px, semibold

Body: Inter (já configurado)
- Base: 16px, regular
- Small: 14px, regular
- Caption: 12px, medium

Line Heights:
- Headings: 1.2
- Body: 1.6
- Captions: 1.4
```

**Implementar:**

```typescript
// next.config.ts
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

export default nextConfig = {
  // ...
}
```

---

## 2️⃣ COMPONENTES DE INTERFACE

### Botões - Variações

```jsx
// Primary (Ação principal)
<Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold shadow-md hover:shadow-lg transition-all">
  Novo Empréstimo
</Button>

// Secondary (Ação secundária)
<Button className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg px-6 py-3 font-bold">
  Registrar Pagamento
</Button>

// Outline (Ação terciária)
<Button className="border-2 border-slate-300 hover:border-slate-400 text-slate-600 hover:bg-slate-50 rounded-lg px-6 py-3 font-bold">
  Cancelar
</Button>

// Danger (Ações destrutivas)
<Button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-3 font-bold">
  Deletar
</Button>

// Ghost (Botões suaves)
<Button className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-4 py-2">
  Mais opções
</Button>
```

### Cards - Padrões

```jsx
// Standard Card
<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
  {content}
</div>

// Elevated Card
<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100">
  {content}
</div>

// Gradient Card (Premium)
<div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-200/50 shadow-sm">
  {content}
</div>

// Glass Morphism
<div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm">
  {content}
</div>
```

### Formas & Raios

```
Não usar: Botões quadrados ou borderRadius 0
Padrão:
├─ Inputs: 8px (radius-md)
├─ Buttons: 10px (radius-lg)
├─ Cards: 16px (radius-xl)
├─ Modais: 20px (radius-2xl)
└─ Sections: 20px+ (radius-3xl)

Nunca menos de 8px!
```

---

## 3️⃣ MICROCOPY & LINGUAGEM

### Tone of Voice

```
Profissional ✅ (não descontraído)
Claro ✅ (sem jargão técnico)
Empático ✅ (entender dificuldades do usuário)
Otimista ✅ (foco em benefícios)

Exemplo BOM:
"Empréstimo aprovado! 🎉 Você receberá a quantia em sua conta em até 2 horas."

Exemplo RUIM:
"Erro 200 OK. Processing..."
```

### Textos Padrão

```typescript
// Sucesso
"✓ Empréstimo criado com sucesso!"
"✓ Pagamento registrado. Obrigado!"
"✓ Relatório gerado com sucesso!"

// Erro
"Não conseguimos processar sua solicitação. Tente novamente em alguns minutos."
"Email já existe no sistema. Faça login ou redefina sua senha."
"Permissão negada. Contacte o administrador."

// Loading
"Processando sua solicitação..."
"Carregando dados..."
"Salvando alterações..."

// Empty State
"Nenhum empréstimo ainda."
"Comece criando seu primeiro empréstimo para ver os dados aqui."
```

---

## 4️⃣ ELEMENTOS VISUAIS

### Ícones

**Usar:** Lucide React (já configurado)

```tsx
import { CreditCard, Users, Banknote, FileText, TrendingUp } from 'lucide-react'

// Aplicação
<CreditCard className="h-5 w-5 text-blue-600" />

// Tamanhos
// Ícones navbar: 20-24px
// Ícones buttons: 16-20px
// Ícones decorativos: 32-48px
// Ícones seções: 64px+
```

**Customizados necessários:**
```
├─ Microcrédito (moeda + mãos)
├─ Garantia/Collateral (escudo)
├─ Agente (pessoa com talheres)
├─ Relatório (gráfico customizado)
└─ Auditoria (tick com olho)
```

### Ilustrações

**Para empty states e seções:**

Recomendações:
- Usar unDraw.co (gratuito, customizável)
- Ou Illustration.dev (premium)
- Ou Freepik (múltiplas opções)

Estilo recomendado: **Line art** ou **Flat design**

### Animações

**Princípios:**
- Duração: 150-300ms (não muito lento)
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (padrão)
- Evitar: Rotações, zoom excessivo, tremidas
- Usar para: Transições de página, hover effects, loading

```tsx
import { motion } from 'framer-motion'

// Animação suave de entrada
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>

// Animação de hover em card
<motion.div
  whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
  transition={{ duration: 0.2 }}
>
  Card
</motion.div>
```

---

## 5️⃣ PADRÕES DE LAYOUT

### Grid System

```
Desktop (> 1024px): 12 colunas, gap 32px
Tablet (640-1024px): 8 colunas, gap 24px
Mobile (< 640px): 4 colunas, gap 16px

Exemplo Dashboard:
├─ Main content: 8-9 colunas
├─ Sidebar: 3-4 colunas
└─ Spacing entre: 32px
```

### Spacing System

```
Implementar "8px base unit":
8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px

Uso:
├─ Padding interno: 16px, 24px, 32px
├─ Margin entre elementos: 24px, 32px
├─ Gap em flex: 16px, 24px
├─ Border radius: 8px, 12px, 16px, 20px
└─ Shadows offset: 4px, 8px, 16px
```

---

## 6️⃣ EXEMPLO: REDESIGN DE UM COMPONENTE

### Header Atual (Genérico)

```tsx
// Antes: Sem personalidade
<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80">
  <div className="flex h-20 items-center px-6 gap-6">
    <Input placeholder="Buscar..." />
    <Button>Novo</Button>
  </div>
</header>
```

### Header Redesenhado (Profissional + Marca)

```tsx
// Depois: Com identidade visual
<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-xl shadow-sm">
  <div className="h-20 px-6 md:px-10 flex items-center gap-6 max-w-7xl mx-auto">
    
    {/* Logo + Branding */}
    <Link href="/" className="flex items-center gap-3 group">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
        μ$
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-sm font-black text-slate-900 tracking-tight">MicroCred</span>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">SaaS</span>
      </div>
    </Link>

    {/* Search with Brand Colors */}
    <div className="flex-1 max-w-sm hidden md:flex relative group">
      <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
      <Input
        type="search"
        placeholder="Buscar clientes, empréstimos..."
        className="w-full bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-500 rounded-lg pl-10 transition-all shadow-sm"
      />
    </div>

    {/* CTA Buttons with Brand Colors */}
    <div className="hidden lg:flex items-center gap-3">
      <Button 
        variant="outline" 
        className="border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg px-5 py-2.5 font-bold transition-all"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Pagamento
      </Button>
      <Button 
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-6 py-2.5 font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4 mr-2" />
        Novo Empréstimo
      </Button>
    </div>

    {/* Notifications + User Menu */}
    <div className="flex items-center gap-3 border-l border-slate-200 pl-3 md:pl-6">
      <Button 
        variant="ghost" 
        size="icon"
        className="relative h-10 w-10 rounded-lg hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
      </Button>
      <UserNav />
    </div>
  </div>
</header>
```

**Melhorias:**
- ✅ Gradiente sutil no background
- ✅ Logo com ícone customizado
- ✅ Cores de marca (azul e verde)
- ✅ Efeitos de hover suaves
- ✅ Spacing consistente
- ✅ Sombras profissionais
- ✅ Responsive sem break de UX

---

## 7️⃣ EXEMPLOS DE COMPONENTES PRONTOS

### Empty State

```tsx
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        {description}
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        {action}
      </Button>
    </div>
  )
}
```

### Loading State

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
      />
      <span className="ml-3 text-sm font-medium text-slate-600">
        Carregando...
      </span>
    </div>
  )
}
```

### Success Toast

```tsx
// Usar sonner
import { toast } from 'sonner'

// Aplicação
toast.success('Empréstimo criado com sucesso!', {
  description: 'Número de operação: #LN-2026-0001',
  action: {
    label: 'Ver',
    onClick: () => router.push('/loans/123')
  }
})
```

---

## 8️⃣ PRÓXIMAS AÇÕES

1. **Contratar Designer** (1 semana)
   - Logo + Brand Guidelines
   - UI Kit (Figma)
   - Ícones customizados

2. **Implementar Design Tokens** (esta semana)
   - Colors, typography, spacing, shadows
   - Documentar em design-tokens.ts

3. **Redesenhar Componentes Principais** (próximas 2 semanas)
   - Header
   - Sidebar
   - Cards
   - Botões
   - Formulários

4. **Testes de Marca** (semana 4)
   - Testar com usuários reais
   - Coletar feedback
   - Refinar

---

**Fim das Recomendações de Design**
