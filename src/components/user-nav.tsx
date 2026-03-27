"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function UserNav() {
  const router = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        const name = profile?.full_name || user.email || "Usuário";
        const email = profile?.email || user.email || "";

        // Calculate initials
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setUserData({
          name,
          email,
          initials,
        });
      }
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:ring-4 hover:ring-blue-50 transition-all duration-300"
        >
          <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100">
            {/* <AvatarImage src="/avatars/01.png" alt="@usuario" /> */}
            <AvatarFallback className="text-blue-700 font-extrabold text-sm">
              {userData?.initials || "US"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userData?.name || "Carregando..."}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            Configurações
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
