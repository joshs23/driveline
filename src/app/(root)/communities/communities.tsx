import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import CreateCommunity from "./createcommunity";

async function countMembers(communityId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("CommunityMember")
    .select("user_id")
    .eq("community_id", communityId);

  if (error) throw error;

  return data?.length || 0;
}

export default async function Communities() {
  const supabase = await createClient();
  const { data: communities } = await supabase.from("Community").select("*");

  if (!communities || communities.length <= 0)
    return <div>There are no communities. Create one!</div>;

  const listings = communities.map((community) => ({
    id: community.id,
    name: community.name,
    description: community.description,
    count: countMembers(community.id),
  }));

  return (
    <div className="container w-fit py-8">
      <div className="flex gap-4">
        <h1 className="mb-2 text-3xl font-semibold">Communities</h1>
        <CreateCommunity />
      </div>
      <p className="mb-4 opacity-70">Find your people!</p>
      <div className="gap-4 grid grid-cols-4">
        {listings.map((listing) => (
          <Link href={`/communities/${listing.id}`} passHref key={listing.name}>
            <div className="min-h-48 min-w-48 max-w-96 rounded-lg border-2 p-4 shadow-md transition-shadow duration-300 hover:bg-secondary">
              <h1 className="mb-2 text-xl font-semibold">{listing.name}</h1>
              <h2 className="text-md mb-1 font-medium">
                Members: {listing.count}
              </h2>
              <p className="mb-4">{listing.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}