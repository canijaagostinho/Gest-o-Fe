"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Client } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

interface ClientsClientProps {
  data: Client[];
  userRole: string;
}

export function ClientsClient({ data, userRole }: ClientsClientProps) {
  const [currentTab, setCurrentTab] = useState("all");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const columns = getColumns(userRole);

  const filteredData = data.filter((client) => {
    // Tab Filtering
    if (currentTab === "active" && client.classification !== "Regular")
      return false;
    if (currentTab === "risk" && client.classification !== "Em risco")
      return false;
    if (currentTab === "defaulted" && client.classification !== "Inadimplente")
      return false;

    // Search Filtering
    if (searchQuery) {
      const matchName =
        client.full_name?.toLowerCase().includes(searchQuery) || false;
      const matchEmail =
        client.email?.toLowerCase().includes(searchQuery) || false;
      const matchCode =
        client.code?.toLowerCase().includes(searchQuery) || false;
      const matchDoc =
        client.id_number?.toLowerCase().includes(searchQuery) || false;
      if (!matchName && !matchEmail && !matchCode && !matchDoc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="all"
        className="w-full mb-6"
        onValueChange={setCurrentTab}
      >
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger
            value="all"
            className="rounded-md px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-md px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm text-emerald-600"
          >
            Ativos
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="rounded-md px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm text-amber-600"
          >
            Em Risco
          </TabsTrigger>
          <TabsTrigger
            value="defaulted"
            className="rounded-md px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm text-red-600"
          >
            Inadimplentes
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
