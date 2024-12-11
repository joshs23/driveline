import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Feed from "@/app/(root)/feed";
import { Separator } from "@/components/ui/separator";

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the community from the id
  const { data: community } = await supabase
    .from("Community")
    .select("*")
    .eq("id", id)
    .single();

  if (!community) {
    return notFound();
  }

  // Get the member information for the community
  const { data: members } = await supabase
    .from("CommunityMemberWithProfile")
    .select("*")
    .eq("community_id", id);

  // Check if the current user is a member of the community
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  const isMember = !!members?.find((member) => member.user_id === userId);

  // Get the posts for the community
  const { data: rawPosts } = await supabase
    .from("Post")
    .select("*, PostImage(*), Comment(*)")
    .eq("community", id)
    .order("id", { ascending: false });

  // map the raw posts to a more usable format
  const posts =
    rawPosts?.map((post) => ({
      ...post,
      Comment: Array.isArray(post.Comment) ? post.Comment : [],
      content: post.body,
      author: post.creator,
      createdAt: post.created_at,
    })) || [];

  // handle adding the user to the community
  const handleJoin = async () => {
    "use server";
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId || !community?.id) return;

    await supabase
      .from("CommunityMember")
      .insert([{ community_id: Number(community.id), user_id: userId }]);

    redirect(`/communities/${community.id}`);
  };

  // handle removing the user from the community
  const handleLeave = async () => {
    "use server";
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId || !community?.id) return;

    await supabase
      .from("CommunityMember")
      .delete()
      .eq("community_id", Number(community.id))
      .eq("user_id", userId);

    redirect(`/communities/${community.id}`);
  };

  return (
    <div className="container flex max-h-screen w-full flex-col gap-4 rounded-lg px-4 py-6">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-4 p-4">
        {/* Community Header - Name, Desc */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">{community?.name}</h1>
          <Separator className="my-2 bg-neutral-600" />
          <p>{community?.description}</p>
        </div>

        {/* Join/Leave buttons */}
        <Button
          onClick={!isMember ? handleJoin : handleLeave}
          className="rounded-md bg-primary/20 px-4 text-red-400 hover:bg-primary/10"
        >
          {isMember ? "Leave" : "Join"} Community
        </Button>
      </div>
      <div className="flex h-full gap-8">
        {/* Feed */}
        <div className="flex grow flex-col gap-2 rounded-md border p-4 shadow-lg">
          <h1 className="text-3xl font-bold">Feed</h1>
          <Feed initalPosts={posts} communityId={id} inline />
        </div>
        {/* Members Section */}
        <div className="flex w-1/4 flex-col gap-2 rounded-md border p-4 shadow-lg">
          <h2 className="text-3xl font-bold">Members</h2>
          {(members?.length ?? 0) <= 0 ? (
            <p className="italic">There are no members in this community.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Member Card Linking to their profile */}
              {members?.map((member) => (
                <Link
                  key={member.username}
                  href={`/user/${member.username}`}
                  passHref
                  legacyBehavior
                >
                  <div className="hover flex cursor-pointer items-center rounded-md border p-2 shadow-lg transition-colors duration-200 hover:bg-neutral-900">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage
                        src={
                          (member?.profile_picture_url &&
                            `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${member.profile_picture_url}`) ||
                          undefined
                        }
                        alt={`${member.display_name}'s avatar`}
                        className="rounded-full"
                      />
                      <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full font-bold">
                        {member.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4">
                      {/* Display Name */}
                      <p className="text-lg font-medium">{member.display_name}</p>
                      {/* Username */}
                      <p className="text-sm">@{member.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
