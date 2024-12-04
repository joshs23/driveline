import { createClient } from "@/utils/supabase/server";
import UserPage from "./user-page";
import Vehicles from "./vehicles";
import Feed from "../../feed";
import { notFound } from "next/navigation";

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
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
  }

  const formattedData = data?.map(post => ({
    ...post,
    Comment: Array.isArray(post.Comment) ? post.Comment : []
  })) || null;

  return (
    <main className="flex h-screen w-full flex-col bg-secondary">
      <UserPage username={username} />

      <div className="grid w-full grow grid-cols-2 py-4">
        <div className="flex w-full flex-col gap-4 border-r">
          <h1 className="px-6 pt-4 text-3xl font-bold">Feed</h1>
          <Feed initalPosts={formattedData} disableCreatePost inline />
        </div>

        <Vehicles username={username} />
      </div>
    </main>
  );
}
