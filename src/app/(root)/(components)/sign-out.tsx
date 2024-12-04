"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function SignOut({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return (
    <button
      className="w-full"
      onClick={async () => {
        console.log("Signing out");
        const { error } = await supabase.auth.signOut();
        queryClient.invalidateQueries({ queryKey: ["client_user"] });
        redirect("/login");
      }}
    >
      {children}
    </button>
  );
}
