import { createClient } from "@/utils/supabase/server";
import UserPage from "./user-page";
import Vehicles from "./vehicles";
import Feed from "../../feed";
import { notFound } from "next/navigation";
import FriendsList from "./friends-list";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string | undefined }>;
}) {
  const { username } = await params;

  if (!username)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        No username found in the route.
      </div>
    );

  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("username", username)
    .single();

  if (userError) {
    console.error("Error fetching profile:", userError);
    return notFound();
  }

  const { data, error } = await supabase
    .from("Post")
    .select("*, PostImage(*), Comment(*)")
    .eq("creator", user.user_id)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
  }

  const formattedData =
    data?.map((post) => ({
      ...post,
      Comment: Array.isArray(post.Comment) ? post.Comment : [],
    })) || null;

  return (
    <>
    <main className="flex w-full flex-col bg-secondary">
      <div className="relative">
        <UserPage username={username} />
      </div>
      <div className="grid w-full grow grid-cols-10 py-4">
        <div className="flex w-full flex-col gap-4 border-r col-span-2 h-screen overflow-y-auto">
          <Vehicles username={username} />
        </div>
        <div className="flex w-full flex-col gap-4 border-r col-span-6 overflow-y-auto">
          <h1 className="px-6 pt-4 text-3xl font-bold text-center">Feed</h1>
          <Feed
            initalPosts={formattedData}
            feedUserId={user.user_id}
            disableCreatePost
            inline
          />
        </div>
        <div className="flex w-full flex-col gap-4 border-r col-span-2 h-screen overflow-y-auto">
          <FriendsList username={username} />
        </div>
      </div>
    </main>
    </>
  );
}
