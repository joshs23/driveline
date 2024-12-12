import { createClient } from "@/utils/supabase/server";
import UserPage from "./user-page";
import Vehicles from "./vehicles";
import Feed from "../../feed";
import { notFound } from "next/navigation";
import FriendsList from "./friends-list";

// Page for the user profile gets the username from the route and fetches the user's information
export default async function Page({
  params,
}: {
  params: Promise<{ username: string | undefined }>;
}) {
  const { username } = await params;

  // if for some reason there is no username in the route, return a message
  if (!username)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        No username found in the route.
      </div>
    );

  const supabase = await createClient();

  // Fetch the user's profile
  const { data: user, error: userError } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("username", username)
    .single();

  if (userError) {
    console.error("Error fetching profile:", userError);
    return notFound();
  }

  // Fetch the user's posts
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

  // Return the user page with the user's information and posts
  return (
    <>
      {/* Header with banner image, profile pic and user info */}
      <main className="flex w-full flex-col bg-secondary">
        <div className="relative">
          <UserPage username={username} />
        </div>
        {/* The rest is in three columns the height of the screen so users can scroll down and get a larger view 
        of user's content (initially blocked by the banner and profile pic header)*/}
        <div className="grid h-screen w-full grow grid-cols-11 py-4">
          <div className="col-span-3 flex w-full flex-col gap-4 overflow-y-auto border-r">
            <Vehicles username={username} />
          </div>
          <div className="col-span-5 flex w-full flex-col gap-4 overflow-y-auto border-r">
            <h1 className="px-6 pt-4 text-center text-3xl font-bold">Feed</h1>
            <Feed
              initalPosts={formattedData}
              feedUserId={user.user_id}
              disableCreatePost
              inline
            />
          </div>
          <div className="col-span-3 flex w-full flex-col gap-4 overflow-y-auto border-r">
            <FriendsList username={username} />
          </div>
        </div>
      </main>
    </>
  );
}
