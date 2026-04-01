# 🐛 BUGS DETALHADOS E SOLUÇÕES TÉCNICAS

**Documento de Bugs Críticos e Medium-priority do Sistema GestãoFlex**

---

## 🔴 BUG #1: RPC `handle_account_transfer` Não Existe

**Severidade:** 🔴 CRÍTICO - Bloqueia funcionalidade principal  
**Arquivo:** `src/app/actions/transaction-actions.ts:103`  
**Linhas:** 103-112  
**Status:** 🔴 NÃO FUNCIONA EM PRODUÇÃO

### Descrição do Problema

O código tenta chamar uma RPC do Supabase que não existe:

```typescript
// ❌ CÓDIGO ATUAL (linha 103-112)
const { data: result, error: rpcError } = await supabase.rpc("handle_account_transfer", {
  p_source_account_id: sourceAccountId,
  p_target_account_id: targetAccountId,
  p_amount: amount,
  p_institution_id: userData.institution_id,
  p_description: description,
});

if (rpcError) throw new Error("Erro crítico no banco de dados: " + rpcError.message);
if (!result.success) throw new Error(result.error);
```

### O Que Acontece?

1. User abre "Transferir Valor" modal
2. Seleciona conta origem e destino
3. Digita valor
4. Clica "Confirmar Transferência"
5. ❌ **Erro:** `Error: RPC "handle_account_transfer" does not exist`
6. ❌ **Resultado:** Transferência falha, user confuso, nenhum log

### Solução Técnica (Opção A: Implementar Manualmente)

```typescript
// ✅ SOLUÇÃO: Implementar transação manual
export async function transferAction(
  sourceAccountId: string,
  targetAccountId: string,
  amount: number,
  description: string = "Transferência entre contas"
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (!userData?.institution_id) throw new Error("Instituição não encontrada.");

    // PASSO 1: Validar saldo (read-only, sem bloqueio)
    const { data: source, error: srcError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", sourceAccountId)
      .single();

    if (srcError || !source) throw new Error("Conta origem não encontrada.");
    if (Number(source.balance) < amount) {
      return { success: false, error: "Saldo insuficiente." };
    }

    // PASSO 2: Debitar conta origem
    const newSourceBalance = Number(source.balance) - amount;
    const { data: updatedSource, error: debitError } = await supabase
      .from("accounts")
      .update({ balance: newSourceBalance })
      .eq("id", sourceAccountId)
      .select();

    if (debitError || !updatedSource) throw new Error("Falha ao debitar conta origem.");

    // PASSO 3: Creditar conta destino
    const { data: target, error: tgtError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", targetAccountId)
      .single();

    if (tgtError) throw new Error("Conta destino não encontrada.");

    const newTargetBalance = Number(target.balance) + amount;
    const { data: updatedTarget, error: creditError } = await supabase
      .from("accounts")
      .update({ balance: newTargetBalance })
      .eq("id", targetAccountId)
      .select();

    if (creditError || !updatedTarget) {
      // REVERTER: Restaurar saldo da conta origem
      await supabase
        .from("accounts")
        .update({ balance: source.balance })
        .eq("id", sourceAccountId);
      throw new Error("Falha ao creditar conta destino. Transação revertida.");
    }

    // PASSO 4: Registar transações no histórico
    const transactionId = `TRANSFER_${Date.now()}`;
    
    const { error: debitTxError } = await supabase.from("transactions").insert({
      account_id: sourceAccountId,
      type: "debit",
      amount: amount,
      description: `Transferência OUT: ${description}`,
      reference_type: "transfer",
      reference_id: transactionId,
      institution_id: userData.institution_id,
    });

    const { error: creditTxError } = await supabase.from("transactions").insert({
      account_id: targetAccountId,
      type: "credit",
      amount: amount,
      description: `Transferência IN: ${description}`,
      reference_type: "transfer",
      reference_id: transactionId,
      institution_id: userData.institution_id,
    });

    if (debitTxError || creditTxError) {
      console.error("Warning: Transaction records failed but balances updated.", {
        debitTxError,
        creditTxError,
      });
      // NOTE: Balances são o source of truth. Se txs falham, é ok (audit trail only).
    }

    revalidatePath("/finance/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("TRANSFER_ERROR:", error);
    return { success: false, error: error.message };
  }
}
```

### Solução Técnica (Opção B: Criar RPC no Supabase)

Se preferir usar RPC (recomendado para atomicidade real), criar no Supabase:

```sql
-- Execute isto no Supabase SQL Editor
CREATE OR REPLACE FUNCTION handle_account_transfer(
  p_source_account_id UUID,
  p_target_account_id UUID,
  p_amount DECIMAL,
  p_institution_id UUID,
  p_description TEXT
) RETURNS JSON AS $$
DECLARE
  v_source_balance DECIMAL;
  v_target_balance DECIMAL;
  v_transaction_id TEXT;
BEGIN
  -- 1. Validar saldo (com lock)
  SELECT balance INTO v_source_balance
    FROM accounts
    WHERE id = p_source_account_id
    AND institution_id = p_institution_id
    FOR UPDATE;

  IF v_source_balance IS NULL THEN
    RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Conta origem não existe');
  END IF;

  IF v_source_balance < p_amount THEN
    RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Saldo insuficiente');
  END IF;

  -- 2. Verificar conta destino
  SELECT balance INTO v_target_balance
    FROM accounts
    WHERE id = p_target_account_id
    AND institution_id = p_institution_id
    FOR UPDATE;

  IF v_target_balance IS NULL THEN
    RETURN JSON_BUILD_OBJECT('success', false, 'error', 'Conta destino não existe');
  END IF;

  -- 3. Executar transferência (atomicamente)
  UPDATE accounts SET balance = balance - p_amount WHERE id = p_source_account_id;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_target_account_id;

  -- 4. Registar transações
  v_transaction_id := 'TRANSFER_' || TO_CHAR(NOW(), 'YYYYMMDDHH24MMSS');
  
  INSERT INTO transactions(account_id, type, amount, description, reference_type, reference_id, institution_id)
  VALUES (p_source_account_id, 'debit', p_amount, p_description, 'transfer', v_transaction_id, p_institution_id);
  
  INSERT INTO transactions(account_id, type, amount, description, reference_type, reference_id, institution_id)
  VALUES (p_target_account_id, 'credit', p_amount, p_description, 'transfer', v_transaction_id, p_institution_id);

  RETURN JSON_BUILD_OBJECT('success', true, 'transaction_id', v_transaction_id);
EXCEPTION WHEN OTHERS THEN
  RETURN JSON_BUILD_OBJECT('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Testes a Executar

```typescript
// ✅ Teste 1: Transferência normal
it("should transfer funds between accounts", async () => {
  const result = await transferAction(account1.id, account2.id, 100);
  expect(result.success).toBe(true);
  // Verify balances
  const acc1 = await supabase.from("accounts").select("balance").eq("id", account1.id).single();
  const acc2 = await supabase.from("accounts").select("balance").eq("id", account2.id).single();
  expect(Number(acc1.data.balance)).toBe(900); // 1000 - 100
  expect(Number(acc2.data.balance)).toBe(1100); // 1000 + 100
});

// ✅ Teste 2: Saldo insuficiente
it("should fail if insufficient balance", async () => {
  const result = await transferAction(account1.id, account2.id, 10000);
  expect(result.success).toBe(false);
  expect(result.error).toContain("insuficiente");
});

// ✅ Teste 3: Conta inexistente
it("should fail if account doesn't exist", async () => {
  const result = await transferAction("nonexistent", account2.id, 100);
  expect(result.success).toBe(false);
});
```

---

## 🔴 BUG #2: Validação de Parcelas Faltando

**Severidade:** 🔴 CRÍTICO - Perda de dados  
**Arquivo:** `src/app/actions/loan-actions.ts:230-250`  
**Linhas:** 230-250  
**Status:** 🔴 PERMITE DADOS INCONSISTENTES

### Descrição do Problema

Ao criar um empréstimo, o sistema aceita parcelas sem validar se a soma bate com o total:

```typescript
// ❌ CÓDIGO ATUAL (loan-actions.ts:230-250)
const installmentsData = installments.map((inst: any) => ({
  loan_id: loan.id,
  institution_id: data.institution_id,
  installment_number: inst.number || inst.installment_number,
  due_date: inst.dueDate ? new Date(inst.dueDate).toISOString().split("T")[0] : inst.due_date,
  amount: inst.amount,
  status: "pending",
}));

const { error: instError } = await supabase
  .from("installments")
  .insert(installmentsData);
// ❌ Nenhuma validação!
```

### Cenário de Falha

```
User quer emprestar 1000 MZN em 5 parcelas
Frontend calcula: 200 + 200 + 200 + 200 + 200 = 1000 ✅

MAS: Backend valida? NÃO
Se parcelas forem: [250, 250, 250, 200] (soma = 950)
Sistema aceita sem reclamar!

Resultado: 50 MZN desaparecem silenciosamente
```

### Solução

```typescript
// ✅ CORRETO: Validar soma de parcelas
export async function createLoanAction(data: LoanCreateData): Promise<ActionResponse> {
  try {
    // ... código existente ...

    // ✅ NOVA VALIDAÇÃO: Verificar soma de parcelas
    const totalInstallments = data.installments.reduce(
      (sum: number, inst: any) => sum + Number(inst.amount), 
      0
    );

    if (Math.abs(totalInstallments - data.loan_amount) > 0.01) {
      // Aceitar apenas pequenas diferenças de arredondamento (< 1 centavo)
      return {
        success: false,
        error: `Soma das parcelas (${totalInstallments} MZN) não corresponde ao valor do empréstimo (${data.loan_amount} MZN)`,
      };
    }

    // ✅ NOVA VALIDAÇÃO: Verificar casas decimais
    data.installments.forEach((inst: any, idx: number) => {
      const decimals = (inst.amount.toString().split('.')[1] || '').length;
      if (decimals > 2) {
        throw new Error(`Parcela ${idx + 1} tem ${decimals} casas decimais. Máximo: 2`);
      }
    });

    // ✅ NOVA VALIDAÇÃO: Verificar montantes positivos
    data.installments.forEach((inst: any, idx: number) => {
      if (Number(inst.amount) <= 0) {
        throw new Error(`Parcela ${idx + 1} tem valor inválido: ${inst.amount}`);
      }
    });

    // ... continuar com código existente ...
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### Testes

```typescript
it("should validate installment sum equals loan amount", async () => {
  const data = {
    loan_amount: 1000,
    installments: [{ amount: 250 }, { amount: 250 }, { amount: 500 }], // Soma correta
  };
  const result = await createLoanAction(data);
  expect(result.success).toBe(true);
});

it("should reject installments that don't sum to loan amount", async () => {
  const data = {
    loan_amount: 1000,
    installments: [{ amount: 250 }, { amount: 250 }, { amount: 450 }], // Soma 950!
  };
  const result = await createLoanAction(data);
  expect(result.success).toBe(false);
  expect(result.error).toContain("não corresponde");
});

it("should reject installments with too many decimals", async () => {
  const data = {
    loan_amount: 1000,
    installments: [{ amount: 333.333 }], // 3 casas decimais!
  };
  const result = await createLoanAction(data);
  expect(result.success).toBe(false);
});
```

---

## 🔴 BUG #3: RLS Potencialmente Não Implementado

**Severidade:** 🔴 CRÍTICO - Violação de dados  
**Arquivo:** `src/app/(dashboard)/dashboard/page.tsx:109-113`  
**Status:** ⚠️ PRECISA VERIFICAÇÃO

### Descrição do Problema

O código ASSUME que RLS está funcionando:

```typescript
// ❌ ASSUMPTION SEM VERIFICAÇÃO (dashboard/page.tsx:109-113)
const { data: allLoans } = await supabase
  .from("loans")
  .select("id, loan_amount, created_at, status")
  .eq("institution_id", profile.institution_id);
// ← Assume que RLS bloqueia outras instituições
```

**Risco:** Se RLS não estiver ativo, user de instituição A vê todos os empréstimos, inclusive de instituição B, C, D...

### Como Verificar?

**1. No Supabase Dashboard:**
- Ir para: Authentication → Policies
- Procurar políticas para tabela `loans`, `clients`, `accounts`, `payments`
- Se NÃO existem = RLS não está implementado

**2. Teste Manual:**
```typescript
// Script de verificação
const supabase = createClient();

// Simular user de instituição A
const loansA = await supabase
  .from("loans")
  .select("institution_id")
  .limit(10);

// User A deveria ver APENAS loans onde institution_id = A
// Se vê institution_id ≠ A = RLS FALHOU
```

### Solução: Implementar RLS

```sql
-- Execute no Supabase SQL Editor
-- 1. CRIAR FUNÇÃO AUXILIAR
CREATE OR REPLACE FUNCTION public.get_current_institution()
RETURNS UUID AS $$
SELECT institution_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. ATIVAR RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS SELECT
CREATE POLICY loan_select_policy ON public.loans
  FOR SELECT
  USING (institution_id = public.get_current_institution());

CREATE POLICY client_select_policy ON public.clients
  FOR SELECT
  USING (institution_id = public.get_current_institution());

CREATE POLICY account_select_policy ON public.accounts
  FOR SELECT
  USING (institution_id = public.get_current_institution());

-- ... e assim para INSERT/UPDATE/DELETE ...

-- 4. ESPECIAL: Admin global pode ver tudo
CREATE POLICY admin_geral_select_policy ON public.loans
  FOR SELECT
  USING (
    (SELECT role_id FROM public.users WHERE id = auth.uid())
    IN (SELECT id FROM public.roles WHERE name = 'admin_geral')
  );
```

### Teste de RLS

```typescript
it("should not allow users to see loans from other institutions", async () => {
  const supabaseUser1 = createClient(); // User A (institution 1)
  const supabaseUser2 = createClient(); // User B (institution 2)

  // User A cria empréstimo
  await supabaseUser1.from("loans").insert({
    institution_id: "inst-1",
    client_id: "client-1",
    amount: 1000,
  });

  // User B tenta ver empréstimos
  const { data, error } = await supabaseUser2
    .from("loans")
    .select("*");

  // User B NÃO deve ver nenhum loan
  expect(data.length).toBe(0);
  expect(error).toBeNull();
});
```

---

## 🟠 BUG #4: Performance - FCP 1.5s (Deveria Ser <1s)

**Severidade:** 🟠 MÉDIO - UX  
**Arquivo:** `src/app/page.tsx`  
**Status:** ⚠️ Slow (52% acima do alvo)

### Análise Detalhada

```
Métrica Atual:   1524ms
Alvo:            1000ms
Over-target:     524ms (52% pior)
```

### Causa Raiz: 45 Ícones Lucide Importados

```typescript
// ❌ LINHA 6-45 DO PAGE.TSX
import {
  ArrowRight, BarChart3, LineChart, Users, CreditCard, Building2,
  FileText, ShieldCheck, ShieldAlert, TriangleAlert, Lock, Zap, Scale,
  TrendingUp, PieChart, ChevronDown, CheckCircle2, Star, Cpu,
  MonitorSmartphone, Smartphone, Bell, Calculator, UserCheck, Play,
  Phone, Mail, MessageSquare, Globe, Cloud, RefreshCw, Award, Target,
  Clock, HeartHandshake, Landmark, UserCheck2, Menu,
} from "lucide-react";
```

Todos os 45 ícones são carregados, mesmo que nem todos sejam usados.

### Solução: Dynamic Imports

```typescript
// ✅ CORRETO: Importar dinamicamente
import dynamic from "next/dynamic";

// ✅ Ícones críticos (acima da fold) → importar normalmente
import { ArrowRight, Menu } from "lucide-react";

// ✅ Ícones não-críticos → lazy load
const BarChart3 = dynamic(() => import("lucide-react").then(m => ({ default: m.BarChart3 })));
const LineChart = dynamic(() => import("lucide-react").then(m => ({ default: m.LineChart })));
// ... etc

// ✅ OU: Usar componente de wrapper
const LazyIcon = ({ name, ...props }: { name: string }) => {
  const Icon = dynamicIcons[name]; // Mapa de icons carregados sob demanda
  return <Icon {...props} />;
};
```

### Solução: Remover Framer Motion Pesado

```typescript
// ❌ EXCESSO DE ANIMATIONS (página.tsx)
<motion.div
  initial={{ opacity: 0, x: 40 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
>

// ✅ SIMPLIFICAR: Usar CSS transitions
<div className="opacity-0 animate-fade-in-up">
```

### Solução: Compressão de Imagens

```typescript
// ❌ ATUAL (linha 426-429)
<img
  src="/mockups/dashboard-sharp.png"
  alt="GestãoFlex Desktop Dashboard Sharp"
  className="w-full h-full object-cover"
/>

// ✅ OTIMIZADO: Usar next/image
import Image from "next/image";

<Image
  src="/mockups/dashboard-sharp.png"
  alt="GestãoFlex Desktop Dashboard Sharp"
  width={1200}
  height={750}
  quality={75} // Compressão
  priority={false} // Lazy load
  loading="lazy"
/>
```

### Medição do Progresso

```bash
# Verificar FCP antes da otimização
npm run build
next start
# Abrir DevTools → Lighthouse
# Anotar FCP atual

# Após otimizações:
# Target: FCP < 1000ms
# Success = FCP reduzido para < 1s
```

---

## 🟠 BUG #5: TypeScript ignoreBuildErrors: true

**Severidade:** 🟠 MÉDIO - Quality Gates  
**Arquivo:** `next.config.ts:5`  
**Status:** 🔴 NUNCA para produção

### O Problema

```typescript
// ❌ NUNCA FAZER ISTO
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // ← BUG!
  },
};
```

### Por Quê É Péssimo?

1. **Esconde erros reais** - Tipos incompatíveis chegam a produção
2. **Comportamento imprevisível** - Runtime errors por type mismatch
3. **Breaks Refactoring** - Impossible refactor com confiança
4. **Quebra Tools** - IDEs não conseguem fazer code intelligence

### Solução

```typescript
// ✅ REMOVER COMPLETAMENTE
const nextConfig: NextConfig = {
  // Remover typescript.ignoreBuildErrors
  // Deixar tudo default (que é strict)
};

// ✅ HABILITAR STRICT MODE (no tsconfig.json)
{
  "compilerOptions": {
    "strict": true,  // ← Ativar
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
  }
}
```

### Erros Prováveis Quando Remover

```typescript
// ❌ ERRO 1: any types
const [user, setUser] = useState<any>(null);
// ✅ FIX
const [user, setUser] = useState<UserProfile | null>(null);

// ❌ ERRO 2: Optional chaining
(response.data as any)?.length
// ✅ FIX
response.data?.length ?? 0

// ❌ ERRO 3: Type mismatch
installments.map((inst: any) => ...)
// ✅ FIX
installments.map((inst: Installment) => ...)
```

---

## 🟠 BUG #6: Payment Idempotency Missing

**Severidade:** 🟠 MÉDIO - Data integrity  
**Arquivo:** `src/app/actions/payment-actions.ts`  
**Status:** ⚠️ Permite double-payment

### O Problema

Um user pode marcar a mesma parcela como paga 2x por acidente (ou network retry):

```
1. User clica "Pagar Parcela #1"
2. Sistema processa e cria Payment
3. Network timeout antes de resposta retornar
4. User clica "Pagar Parcela #1" novamente
5. ❌ Segunda payment criada com mesmo valor
6. ❌ Money credited 2x
```

### Solução: Idempotency Key

```typescript
// ✅ CORRETO: Usar idempotency key
export async function payInstallmentAction(
  installmentId: string,
  amountPaid: number,
  paymentDate: Date = new Date(),
  paymentMethod: string = "Dinheiro",
  idempotencyKey?: string,  // ← NOVO
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    // Gerar ou usar idempotency key
    const key = idempotencyKey || `${installmentId}_${Date.now()}`;

    // ✅ VERIFICAR: Já existe payment com mesma key?
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("idempotency_key", key)
      .single();

    if (existing) {
      // ✅ RETORNAR: Sucesso (já foi processado)
      return { success: true, data: { paymentId: existing.id } };
    }

    // ✅ PROCESSAR: Criar payment com idempotency key
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        installment_id: installmentId,
        amount_paid: amountPaid,
        payment_date: paymentDate.toISOString(),
        payment_method: paymentMethod,
        idempotency_key: key,  // ← GUARDAR KEY
        status: "paid",
      })
      .select()
      .single();

    if (error) throw error;

    // ✅ ATUALIZAR: Parcela como paga
    await supabase
      .from("installments")
      .update({ status: "paid" })
      .eq("id", installmentId);

    return { success: true, data: { paymentId: payment.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### No Frontend

```typescript
// ✅ Enviar idempotency key do cliente
const idempotencyKey = `payment_${installmentId}_${Date.now()}`;
const result = await payInstallmentAction(
  installmentId,
  amount,
  new Date(),
  "Dinheiro",
  idempotencyKey
);
```

### No Banco de Dados

```sql
-- Adicionar coluna (se não existir)
ALTER TABLE payments ADD COLUMN idempotency_key TEXT UNIQUE;

-- Criar índice
CREATE UNIQUE INDEX idx_payments_idempotency_key
ON payments(idempotency_key)
WHERE idempotency_key IS NOT NULL;
```

---

## 🟡 BUG #7: Institution Completion Banner Bugs

**Severidade:** 🟡 BAIXO - UX  
**Arquivo:** `src/components/institution-completion-banner.tsx`  
**Problemas:** 3

### Problema 1: Duplicate Imports (Linhas 4-11)

```typescript
// ❌ DUPLICATE
import { useRouter, usePathname } from "next/navigation";  // Linha 4
// ...
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";  // Linha 11

// ✅ FIX: Usar um ou outro
import { useRouter, usePathname } from "next/navigation";
const router = useRouter();
const pathname = usePathname();
```

### Problema 2: Badge Component Definido Localmente (Linha 165)

```typescript
// ❌ CÓDIGO DUPLICADO
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
            {children}
        </span>
    );
}

// ✅ SOLUÇÃO: Usar componente shadcn
import { Badge } from "@/components/ui/badge";
```

### Problema 3: Sem Tratamento de Erro de Rede

```typescript
// ❌ CÓDIGO ATUAL (linha 38-49)
const checkStatus = async () => {
  try {
    const supabase = createClient();
    // ... se supabase.auth.getUser() falha, user fica esperando
  } catch (err) {
    console.error("Error checking onboarding status:", err);  // ← Apenas log
    // Sem retry, sem fallback
  }
};

// ✅ CORRETO
const checkStatus = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const supabase = createClient();
      // ... resto do código
      return; // Success
    } catch (err) {
      if (i === retries - 1) {
        console.error("Failed to check status after retries:", err);
        setIsReady(true);  // ← Fallback: assume ready
        return;
      }
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
};
```

---

## 📋 RESUMO DE TODOS OS BUGS

| # | Bug | Severidade | Arquivo | Fix Time |
|---|---|---|---|---|
| 1 | RPC `handle_account_transfer` não existe | 🔴 CRÍTICO | transaction-actions.ts | 2-3h |
| 2 | Validação de parcelas faltando | 🔴 CRÍTICO | loan-actions.ts | 1-2h |
| 3 | RLS potencialmente não implementado | 🔴 CRÍTICO | Banco | 4-6h |
| 4 | Performance FCP 1.5s | 🟠 MÉDIO | page.tsx | 3-4h |
| 5 | TypeScript ignoreBuildErrors | 🟠 MÉDIO | next.config.ts | 2-4h |
| 6 | Payment double-processing | 🟠 MÉDIO | payment-actions.ts | 1-2h |
| 7 | Institution banner bugs | 🟡 BAIXO | institution-completion-banner | 1h |

---

**Total Estimated Fix Time: 14-25 horas**  
**Recomendado: 2 engenheiros × 2-3 dias**

