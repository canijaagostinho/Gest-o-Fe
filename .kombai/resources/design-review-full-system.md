# Design Review Results: MicroCredit SaaS — Sistema Completo

**Review Date**: 2026-02-15
**Routes**: Todas as páginas (/, /auth/login, /auth/signup, /clients, /loans, /payments, /institutions, /reports, /settings)
**Focus Areas**: Visual Design, UX/Usability, Responsive/Mobile, Accessibility, Micro-interactions/Motion, Consistency, Performance

> **Note**: This review was conducted through static code analysis only. Visual inspection via browser would provide additional insights into layout rendering, interactive behaviors, and actual appearance.

## Summary

O MicroCredit SaaS tem um design visual forte com um padrão premium (gradients, blur, shadows arredondados). No entanto, apresenta **problemas significativos de consistência** entre páginas, **violações de acessibilidade** (textos demasiado pequenos, falta de ARIA labels), **dados mock hardcoded** em produção, e **queries redundantes ao Supabase** que degradam a performance. A base visual é boa mas precisa de padronização urgente.

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | `text-[10px]` usado extensivamente em labels, badges e subtítulos — viola WCAG mínimo de 12px (0.75rem). Afeta leitura para utilizadores com visão reduzida. | 🔴 Critical | Accessibility | `src/app/(dashboard)/page.tsx:269,384,409,437,461` + `src/components/sidebar.tsx:235,322` |
| 2 | Carousel de alertas auto-roda a cada 5s sem `aria-live="polite"`, sem controlo por teclado, e sem pausa ao hover/focus. Utilizadores de leitores de ecrã não conseguem acompanhar. | 🔴 Critical | Accessibility | `src/app/(dashboard)/page.tsx:89-95,308-363` |
| 3 | Botões do carousel (indicadores de dots) não têm `aria-label` descritivo — aparecem como botões sem nome para leitores de ecrã. | 🔴 Critical | Accessibility | `src/app/(dashboard)/page.tsx:313-318` |
| 4 | Gráficos (AreaChart, PieChart, ComposedChart) não têm alternativas acessíveis — sem `role="img"`, sem `aria-label`, sem tabela de dados alternativa. | 🔴 Critical | Accessibility | `src/components/dashboard/overview-chart.tsx`, `src/components/dashboard/risk-chart.tsx`, `src/components/dashboard/gauge-chart.tsx` |
| 5 | Hero banner: botões "Novo Empréstimo" e "Ver Relatórios" são `<Button>` sem `href` — não navegam para nenhuma rota. Clicando neles nada acontece. | 🔴 Critical | UX/Usability | `src/app/(dashboard)/page.tsx:280-286` |
| 6 | `UserNav.handleSignOut()` redireciona para `/login` em vez de `/auth/login` — leva ao 404 após logout. | 🔴 Critical | UX/Usability | `src/components/user-nav.tsx:57-58` |
| 7 | Secção "Prioridades do Dia" mostra dados hardcoded (15 parcelas, MT 4.560,00, 3 aprovações) em vez de dados reais do Supabase. Utilizadores veem informações falsas. | 🟠 High | UX/Usability | `src/app/(dashboard)/page.tsx:582-618` |
| 8 | Search bar no Header não tem funcionalidade implementada — campo decorativo que frustra utilizadores ao tentar pesquisar. | 🟠 High | UX/Usability | `src/components/header.tsx:50-57` |
| 9 | Tabs de filtro na página de Clientes (Todos/Ativos/Em Risco/Inadimplentes) não filtram realmente a tabela — o `TabsContent` não está conectado ao filtro. | 🟠 High | UX/Usability | `src/app/(dashboard)/clients/page.tsx:80-87` |
| 10 | Dashboard faz 5+ queries Supabase separadas no mount (user, profile, institution, loans, payments, overdue, total) — deveria consolidar em 1-2 queries ou usar RPC. | 🟠 High | Performance | `src/app/(dashboard)/page.tsx:98-208` |
| 11 | User/role fetch duplicado: Sidebar, Header, Layout e Dashboard cada um faz a sua própria query `getUser() + profile` — 4x a mesma informação. | 🟠 High | Performance | `src/components/sidebar.tsx:48-83`, `src/components/header.tsx:16-30`, `src/app/(dashboard)/layout.tsx:23-49`, `src/app/(dashboard)/page.tsx:98-120` |
| 12 | `OverviewChart` e `RevenueTrendChart` usam dados mock estáticos hardcoded em vez de dados reais, mas são apresentados como dados reais na UI. | 🟠 High | UX/Usability | `src/components/dashboard/overview-chart.tsx:5-41`, `src/components/dashboard/revenue-trend-chart.tsx:16-29` |
| 13 | Contraste insuficiente: textos `text-blue-50/90` e `text-blue-100` sobre fundo `bg-blue-600` no hero podem não atingir ratio 4.5:1 WCAG AA. | 🟠 High | Accessibility | `src/app/(dashboard)/page.tsx:269,277,293-302` |
| 14 | Cards usados como links (Módulos grid) não têm semântica correcta — o link `<a>` envolve um Card inteiro mas sem `role` ou indicação visual de que toda a área é clicável. | 🟠 High | Accessibility | `src/app/(dashboard)/page.tsx:535-555` |
| 15 | `border-radius` extremamente inconsistente: usa `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-[1.5rem]` (24px), `rounded-[2rem]` (32px), `rounded-[2.5rem]` (40px), `rounded-[3rem]` (48px), `rounded-full` — 7+ valores diferentes sem padrão. | 🟡 Medium | Consistency | Múltiplos ficheiros |
| 16 | Headers de página inconsistentes: `/clients` usa `text-3xl font-bold`, `/reports` usa `text-4xl font-black`, `/settings` usa `text-3xl font-bold`, `/institutions` usa `text-3xl font-bold` sem subtítulo estilizado. | 🟡 Medium | Consistency | `src/app/(dashboard)/clients/page.tsx:68`, `src/app/(dashboard)/reports/page.tsx:183`, `src/app/(dashboard)/institutions/page.tsx:24` |
| 17 | Estilos de botão inconsistentes entre páginas: Clients usa `rounded-xl`, Payments usa `rounded-xl`, Dashboard usa `rounded-full`, Institutions usa o default do shadcn (rounded-md). | 🟡 Medium | Consistency | Múltiplos ficheiros |
| 18 | Padding de página inconsistente: Dashboard usa `p-4 md:p-8 pt-2`, Clients usa `p-8 pt-6`, Payments usa `p-8 pt-6`, Institutions usa `p-8 pt-6`, Settings usa `pt-2` sem padding lateral. | 🟡 Medium | Consistency | Múltiplos ficheiros |
| 19 | Loading states inconsistentes: Dashboard usa `<Skeleton>`, Settings/Reports usam `animate-spin border-b-2` spinner customizado, Loading.tsx usa `<Loader2>`. | 🟡 Medium | Consistency | `src/app/(dashboard)/page.tsx:211-224`, `src/app/(dashboard)/settings/page.tsx:137-142`, `src/app/(dashboard)/loading.tsx:1-12` |
| 20 | Card base component tem classe `premium-card` (com hover transform, gradient bg) mas a maioria das páginas a anula com `border-none shadow-[...]` — indica que o componente base não reflecte o uso real. | 🟡 Medium | Consistency | `src/components/ui/card.tsx:10`, `src/app/(dashboard)/page.tsx:478,499,565` |
| 21 | Página de Institutions (`/institutions`) usa styling minimalista genérico (botão default, sem sombras, sem subtítulo) destoando completamente do design premium das restantes páginas. | 🟡 Medium | Visual Design | `src/app/(dashboard)/institutions/page.tsx:21-37` |
| 22 | Settings page usa `<select>` nativo do HTML em vez do componente `Select` do shadcn — visualmente inconsistente com o resto do design system. | 🟡 Medium | Consistency | `src/app/(dashboard)/settings/page.tsx:403-411,424-432` |
| 23 | Settings page usa `<table>` HTML nativo para lista de utilizadores em vez do componente `DataTable` ou `Table` do shadcn. | 🟡 Medium | Consistency | `src/app/(dashboard)/settings/page.tsx:294-322` |
| 24 | Animações no Dashboard com variantes definidas `y: 0` → `y: 0` (sem movimento) — as animações de entrada estão efectivamente desactivadas. | 🟡 Medium | Micro-interactions | `src/app/(dashboard)/page.tsx:247-249,473-475,518-519,561-562` |
| 25 | `template.tsx` aplica animação spring em TODA a navegação de página (opacity + y translate) — pode causar delay perceptível e jank em transições rápidas. | 🟡 Medium | Performance | `src/app/template.tsx:6-16` |
| 26 | Hover effect nos cards de módulo combina `scale-110 + -rotate-3` — pode ser visualmente agressivo e causar reflow layout em grelhas densas. | 🟡 Medium | Micro-interactions | `src/app/(dashboard)/page.tsx:538` |
| 27 | Data tables não mostram indicador visual de scroll horizontal em mobile — utilizadores podem não saber que há mais colunas. | 🟡 Medium | Responsive/Mobile | `src/components/ui/data-table.tsx:41` |
| 28 | Sidebar não tem overlay/backdrop no mobile quando aberta via Sheet — o conteúdo principal permanece interactivo atrás. | ⚪ Low | Responsive/Mobile | `src/components/header.tsx:38-47` |
| 29 | Botão de notificações no header tem badge de ponto vermelho animado (`animate-pulse`) permanente — sem lógica para mostrar/ocultar baseado em notificações reais. | ⚪ Low | UX/Usability | `src/components/header.tsx:82-85` |
| 30 | `framer-motion` importado via template.tsx em todas as rotas, incluindo páginas que não usam animações — bundle size desnecessário. | ⚪ Low | Performance | `src/app/template.tsx:3` |
| 31 | Hardcoded colors: `bg-[#F8FAFC]` no layout em vez de usar `bg-background` token existente. | ⚪ Low | Visual Design | `src/app/(dashboard)/layout.tsx:84,91` |
| 32 | Charts usam `ResponsiveContainer` do recharts em vez de `ChartContainer` do shadcn — perde features de theming e tooltip integrado. | ⚪ Low | Consistency | `src/components/dashboard/overview-chart.tsx:45`, `src/components/dashboard/risk-chart.tsx:108`, `src/components/dashboard/gauge-chart.tsx:28` |

## Criticality Legend
- 🔴 **Critical** (6): Quebra funcionalidade ou viola padrões de acessibilidade
- 🟠 **High** (8): Impacto significativo na experiência do utilizador ou qualidade do design
- 🟡 **Medium** (13): Problema notável que deve ser resolvido
- ⚪ **Low** (5): Melhoria desejável

## Key Strengths
- Design visual premium com gradientes, sombras e border-radius arredondados bem executados
- Bom uso de design tokens no globals.css (cores em HSL com CSS variables)
- Sidebar com animação de layoutId do framer-motion para indicador activo
- Dashboard KPIs com dados reais do Supabase (excepto os gráficos e prioridades)
- Sistema de alertas carousel criativo e informativo
- Bom uso do component library shadcn/ui

## Next Steps

### Prioridade 1 — Corrigir Críticos (Semana 1)
1. Corrigir rota de logout (`/login` → `/auth/login`)
2. Adicionar href/Link aos botões do hero banner
3. Aumentar `text-[10px]` para mínimo `text-xs` (12px)
4. Adicionar `aria-live`, `aria-label` e keyboard controls ao carousel
5. Adicionar alternativas acessíveis aos gráficos

### Prioridade 2 — Resolver UX (Semana 2)
6. Substituir dados mock hardcoded por dados reais (Prioridades do Dia, Charts)
7. Implementar funcionalidade de search no header
8. Conectar tabs de filtro à tabela de clientes
9. Consolidar queries Supabase (user context provider)

### Prioridade 3 — Padronizar Design (Semana 3)
10. Definir escala de border-radius (sm: 8px, md: 12px, lg: 16px, xl: 24px)
11. Criar componente `PageHeader` reutilizável
12. Padronizar loading states (usar Skeleton em todo o lado)
13. Migrar `<select>` nativo e `<table>` para componentes shadcn
14. Actualizar página de Institutions para design premium

### Prioridade 4 — Optimizar Performance (Semana 4)
15. Criar UserContext/Provider para evitar queries duplicadas
16. Migrar charts para `ChartContainer` do shadcn
17. Lazy-load framer-motion apenas onde necessário
