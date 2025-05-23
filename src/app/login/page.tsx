import { redirect } from "next/navigation";
import Login from "../login/login";
import { createClient } from "@/utils/supabase/server";

// Login page
export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // If we're already logged in, redirect to the home page
  if (data?.user) {
    console.log(
      "We're already logged in so why are we even here?",
      data.user.id,
    );
    redirect("/");
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <Login />
    </main>
  );
}
