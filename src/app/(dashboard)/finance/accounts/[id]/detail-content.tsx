"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DepositModal } from "../components/deposit-modal";
import { TransferModal } from "../components/transfer-modal";

interface AccountDetailContentProps {
  id: string;
  accountName: string;
  accountBalance: number;
}

export function AccountDetailContent({
  id,
  accountName,
  accountBalance,
}: AccountDetailContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Effect to handle URL actions
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "deposit") setIsDepositOpen(true);
    if (action === "transfer") setIsTransferOpen(true);
  }, [searchParams]);

  const clearAction = () => {
    setIsDepositOpen(false);
    setIsTransferOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const newQuery = params.toString();
    router.replace(`${pathname}${newQuery ? '?' + newQuery : ''}`);
  };

  return (
    <>
      <DepositModal
        isOpen={isDepositOpen}
        onClose={clearAction}
        accountId={id}
        accountName={accountName}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={clearAction}
        sourceAccountId={id}
        sourceAccountName={accountName}
        sourceBalance={accountBalance}
      />
    </>
  );
}
