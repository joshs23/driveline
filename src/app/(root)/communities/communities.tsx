import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import CreateCommunity from "./create-community";
import { Separator } from "@/components/ui/separator";

export default async function Communities() {
  const supabase = await createClient();
  const { data: communities } = await supabase
    .from("Community")
    .select("*, CommunityMember(count)");

  if (!communities || communities.length <= 0)
    return <div>There are no communities. Create one!</div>;

  return (
    <div className="container mx-auto w-fit px-4 py-2">
      <div className="flex gap-4">
        <h1 className="mb-2 text-3xl font-semibold">Communities</h1>
        <CreateCommunity />
      </div>
      <p className="mb-4 opacity-70">Find your people!</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {communities.map((listing) => (
          <Link
            key={listing.name}
            href={`/communities/${listing.id}`}
            passHref
            legacyBehavior
          >
            <div className="flex min-w-48 max-w-96 cursor-pointer flex-col gap-1 rounded-lg border-2 p-4 shadow-md transition-shadow duration-300 hover:bg-secondary">
              <h1 className="text-2xl font-bold">{listing.name}</h1>
              <h2 className="text-md font-semibold">
                Members: {listing.CommunityMember[0]?.count || "None"}
              </h2>
              <Separator className="my-1 bg-neutral-600" />
              <p className="">{listing.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
