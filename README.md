# Gestão Flex - SaaS de Microcrédito

**Gestão Flex** é uma plataforma moderna de gestão para instituições de microcrédito, focada em simplicidade, segurança e escalabilidade.

## 🚀 Funcionalidades Principais

- **Gestão de Clientes**: Cadastro completo com histórico de empréstimos.
- **Empréstimos Automatizados**: Cálculo de parcelas, taxas de juro e cronogramas.
- **Controle de Pagamentos**: Acompanhamento de amortizações e amortizações antecipadas.
- **Auditoria Administrativa**: Trailing de operações financeiras críticas.
- **Multi-Tenant**: Isolamento total de dados entre diferentes instituições.
- **Relatórios**: Geração de relatórios financeiros, PDF e Excel.

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Relatórios**: Resend (Emails), react-pdf, xlsx.

## 📂 Documentação Interna

Para detalhes mais profundos, consulte nossos guias:

- [📖 Arquitetura do Sistema](./docs/architecture.md) - Visão técnica e modelo de dados.
- [🛠️ Guia de Onboarding](./docs/onboarding.md) - Como começar a desenvolver.

## ⚙️ Instalação e Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env.local` (consulte `onboarding.md`).

3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🏗️ Padrões de Código

Este projeto utiliza:
- **Eslint** para consistência de código.
- **Typescript** para segurança de tipos.
- **Server Actions** para comunicação segura entre cliente e servidor.

---

Desenvolvido com foco em eficiência financeira e segurança de dados.
