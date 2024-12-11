import Navbar from "@/app/(root)/(components)/navbar";
import RelationshipBar from "@/app/(root)/(components)/relationship-bar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-grow ml-64">
        {children}
      </div>
      <RelationshipBar />
    </div>
  );
}
