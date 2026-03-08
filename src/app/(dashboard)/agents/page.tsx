import { createClient } from "@/utils/supabase/server";
import { AgentList } from "@/components/agents/agent-list";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile to get institution_id
  const { data: profile } = await supabase
    .from("users")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    return <div>Erro: Instituição não encontrada.</div>;
  }

  // Fetch agents
  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agents:", error);
    return <div>Erro ao carregar agentes.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AgentList data={agents || []} institutionId={profile.institution_id} />
    </div>
  );
}
