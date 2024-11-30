"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/database.types";

async function fetchPosts() {
  const { data, error } = await supabase.from("Post").select("*");
  if (error) {
    console.log(error);
  }
  return data as Database["public"]["Tables"]["Post"]["Insert"][];
}

export default function Feed() {
  const [posts, setPosts] = useState<
    Database["public"]["Tables"]["Post"]["Insert"][]
  >([]);
  const router = useRouter();

  useEffect(() => {
    fetchPosts().then((posts) => {
      setPosts(posts);
    });

    const channel = supabase
      .channel("public:post")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Post" },
        (payload) => {
          console.log(payload);
          setPosts((prev) => [
            ...prev,
            payload.new as Database["public"]["Tables"]["Post"]["Insert"],
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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
