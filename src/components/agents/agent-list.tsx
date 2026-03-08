"use client";

import { useState } from "react";
import { Agent } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, UserPlus } from "lucide-react";
import { deleteAgentAction } from "@/app/actions/agent-actions";
import { toast } from "sonner";
import { AgentForm } from "./agent-form";

interface AgentListProps {
  data: Agent[];
  institutionId: string;
}

export function AgentList({ data, institutionId }: AgentListProps) {
  const [agents, setAgents] = useState(data);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return;
    const res = await deleteAgentAction(id);
    if (res.success) {
      toast.success("Agente excluído");
      // Optimistic update or router.refresh() handled by parent/action revalidate
    } else {
      toast.error(res.error);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingAgent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão de Agentes
          </h2>
          <p className="text-muted-foreground">
            Cadastre agentes e configure comissões.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNew}>
            <UserPlus className="mr-2 h-4 w-4" /> Novo Agente
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum agente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    {agent.full_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{agent.email}</span>
                      <span className="text-muted-foreground">
                        {agent.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{agent.commission_rate}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        agent.status === "active" ? "default" : "secondary"
                      }
                    >
                      {agent.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(agent)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(agent.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AgentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingAgent}
        institutionId={institutionId}
      />
    </div>
  );
}
