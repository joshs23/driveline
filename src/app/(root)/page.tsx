import { createClient } from "@/utils/supabase/server";
import Feed from "./feed";

export default async function Home() {
  const supabase = await createClient();
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

  return <Feed initalPosts={formattedData} />;
}
