import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/database.types";

export default async function Page() {
  const supabase = await createClient();
  const { data: communities } = await supabase.from("Community").select("*");

  if (!communities || communities.length <= 0)
    return <div>There are no communities. Create one!</div>;

  return (
    <div className="container mx-auto py-8">
      {communities.map((community: Tables<"Community">) => (
        <div key={community.id}>
          <h1>{community.name}</h1>
          <p>{community.description}</p>
        </div>
      ))}
    </div>
  );
}