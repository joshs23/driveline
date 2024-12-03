"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default function SignOut({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  return (
    <button
      className="w-full"
      onClick={async () => {
        console.log("Signing out");
        const { error } = await supabase.auth.signOut();
        redirect("/login");
      }}
    >
      {children}
    </button>
  );
}
