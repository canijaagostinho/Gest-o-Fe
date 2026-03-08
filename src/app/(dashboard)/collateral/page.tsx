"use client";

import { createClient } from "@/utils/supabase/client";
import { GroupedCollateralList } from "@/components/collateral/grouped-collateral-list";
import { ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CollateralPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: collaterals, error } = await supabase
        .from("loan_collateral")
        .select(
          `
                    *,
                    loans (
                        id,
                        status,
                        clients (
                            full_name
                        )
                    )
                `,
        )
        .neq("type", "none")
        .order("created_at", { ascending: false });

      if (!error && collaterals) {
        setData(collaterals);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando garantias...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 space-y-6 p-8 pt-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Garantias
          </h2>
          <p className="text-slate-500">
            Gestão de bens vinculados aos contratos de empréstimo.
          </p>
        </div>
        <div className="bg-teal-50 text-teal-700 p-3 rounded-xl flex items-center">
          <ShieldCheck className="h-6 w-6 mr-2" />
          <span className="font-bold text-lg">{data.length}</span>
          <span className="ml-1 text-sm font-medium opacity-80">Registros</span>
        </div>
      </div>

      <div className="mt-6">
        <GroupedCollateralList collaterals={data} />
      </div>
    </motion.div>
  );
}
