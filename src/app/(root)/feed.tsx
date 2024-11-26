"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";

async function fetchPosts() {
  const { data, error } = await createClient().from("Post").select("*");
  if (error) {
    console.log(error);
  }
  return data as Database["public"]["Tables"]["Post"]["Insert"][];
}

export default function Feed() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Database["public"]["Tables"]["Post"]["Insert"][]>([]);

  useEffect(() => {
    fetchPosts().then((posts) => {
      setPosts(posts);
    });

    const channel = supabase
      .channel("public:post")
      .on("postgres_changes", { event: "*", schema: "public", table: "Post" }, (payload) => {
        console.log(payload);
        setPosts((prev) => [...prev, payload.new as Database["public"]["Tables"]["Post"]["Insert"]]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  console.log(posts);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="w-full flex flex-col gap-4 p-4 rounded-lg bg-card">
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
