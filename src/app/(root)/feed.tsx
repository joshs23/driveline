"use client";
import { useEffect, useState } from "react";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";

async function fetchPosts() {
  const supabase = createClient();
  const { data, error } = await supabase.from("Post").select("*");
  if (error) {
    console.log(error);
  }
export default function Feed({
  initalPosts,
}: {
  initalPosts: Database["public"]["Tables"]["Post"]["Row"][] | null;
}) {
  const supabase = createClient();
  const [posts, setPosts] = useState<
    Database["public"]["Tables"]["Post"]["Row"][]
  >(initalPosts || []);

  useEffect(() => {
    const channel = supabase
      .channel("public:post")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Post" },
        (payload) => {
          console.log(payload);

          if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((post) => post.id !== payload.old.id),
            );
            return;
          }

          setPosts((prev) => [
            ...prev,
            payload.new as Database["public"]["Tables"]["Post"]["Row"],
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  console.log(posts);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex w-full flex-col gap-4 rounded-lg bg-card p-4"
        >
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
