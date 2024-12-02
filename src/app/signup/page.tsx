import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignUp from "./signup";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    console.log(
      "We're already logged in so why are we even here?",
      data.user.id,
    );
    redirect("/");
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <SignUp />
    </main>
  );
}
