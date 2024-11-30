"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
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
  const [posts, setPosts] = useState<Database["public"]["Tables"]["Post"]["Insert"][]>([]);
  const router = useRouter();

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-200">
      <button
        onClick={() => router.push('/myprofile')}
        className="mb-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Go to My Profile
      </button>
      {posts.map((post) => (
        <div key={post.id} className="w-full flex flex-col gap-4 p-4 rounded-lg bg-card">
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}
