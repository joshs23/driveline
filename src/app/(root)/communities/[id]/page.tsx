import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("Community")
    .select("*")
    .eq("id", id)
    .single();

  if (!community) return notFound();

  return (
    <div className="container mx-auto py-8">
      <div key={community.id}>
        <h1>{community.name}</h1>
        <p>{community.description}</p>
      </div>
    </div>
  );
}
