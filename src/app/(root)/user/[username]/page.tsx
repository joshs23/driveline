import { createClient } from "@/utils/supabase/server";
import UserPage from "./user-page";
import Vehicles from "./vehicles";
import Feed from "../../feed";
import { notFound } from "next/navigation";
import FriendsList from "./friendslist";

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
    .select("*, PostImage(*)")
    .eq("creator", user.user_id)
    .order("id", { ascending: false });
  if (error) {
    console.error(error);
  }

  return (
    <main className="flex h-screen w-full flex-col bg-secondary">
      <UserPage username={username} />
      <div className="grid w-full grow grid-cols-3 py-4">
        <div className="flex w-full flex-col gap-4 border-r">
          <h1 className="px-6 pt-4 text-3xl font-bold">Feed</h1>
          <Feed initalPosts={data} disableCreatePost inline />
        </div>
        <div className="flex w-full flex-col gap-4 border-r">
          <Vehicles username={username} />
        </div>
        <div className="flex w-full flex-col gap-4 border-r">
          <FriendsList username={username} />
        </div>
      </div>
    </main>
  );
}
