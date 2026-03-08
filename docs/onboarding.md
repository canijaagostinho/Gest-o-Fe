# Guia de Onboarding - Gestão Flex

Bem-vindo ao desenvolvimento do **Gestão Flex**! Este guia ajudará você a configurar seu ambiente e entender como contribuir para o projeto.

## 1. Requisitos Prévios

- **Node.js**: Versão 20 ou superior.
- **Git**: Para controle de versão.
- **Supabase CLI**: Recomendado para gerenciar migrações e banco de dados local.

## 2. Configuração do Ambiente

1. **Clonar o repositório**:
   ```bash
   git clone <repo-url>
   cd MicrocreditoSaas
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz com as seguintes chaves (peça os valores ao administrador):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Apenas para ambiente de servidor
   ```

4. **Rodar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

## 3. Estrutura de Diretórios

- `src/app`: Rotas da aplicação (App Router).
  - `(dashboard)`: Rotas internas protegidas.
  - `actions`: Lógica de backend (Server Actions).
- `src/components`: Componentes React (UI, formulários, tabelas).
- `src/hooks`: Hooks customizados para lógica de estado.
- `src/lib`: Funções utilitárias e serviços (PDF, Excel).
- `src/types`: Interfaces e tipos TypeScript.
- `supabase/migrations`: Scripts SQL para o banco de dados.

## 4. Padrões de Desenvolvimento

- **Nomenclatura**: Use camelCase para variáveis e PascalCase para componentes e tipos.
- **Server vs Client**: Por padrão, componentes são Server Components. Use `"use client"` apenas quando necessário (interatividade, hooks).
- **Tipagem**: Evite usar `any`. Defina interfaces claras para as respostas das APIs e dados do banco.
- **Mensagens de Erro**: Sempre trate exceções em Server Actions e retorne mensagens amigáveis em português.

## 5. Como Contribuir

1. Verifique as tarefas pendentes no gerenciador de projetos.
2. Crie uma branch para sua nova funcionalidade: `feature/nome-da-feature`.
3. Certifique-se de que o lint e a tipagem estão passando:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. Envie seu Pull Request para revisão.
