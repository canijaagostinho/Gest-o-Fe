"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { CollateralReceipt } from "./collateral-receipt";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface CollateralReceiptButtonProps {
  loan: any;
}

export function CollateralReceiptButton({
  loan,
}: CollateralReceiptButtonProps) {
  const collateral = loan.loan_collateral?.[0];

  if (!collateral) return null;

  return (
    <PDFDownloadLink
      document={
        <CollateralReceipt
          institutionName="Microcrédito Solidário" // Helper/Context needed for real name
          clientName={loan.clients?.full_name || "Cliente"}
          loanId={loan.id}
          collateralType={collateral.type}
          collateralDescription={collateral.description}
          collateralValue={collateral.value}
          collateralLocation={collateral.location}
          date={new Date(collateral.created_at).toLocaleDateString("pt-BR")}
        />
      }
      fileName={`garantia-${loan.id.substring(0, 8)}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} // Prevent closing menu immediately
          className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
        >
          <FileText className="mr-2 h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
          {loading ? "Gerando..." : "Comprovante Garantia"}
        </DropdownMenuItem>
      )}
    </PDFDownloadLink>
  );
}
