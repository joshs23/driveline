"use client";
import { useEffect, useState } from "react";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  }, []);

  if (!posts || posts.length === 0)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        There are no posts yet. Create one!
        <CreatePost />
      </div>
    );

  return (
      <ScrollArea className="flex w-full flex-col gap-4 rounded-lg bg-card p-4">
      {posts.map((post) => (
      </ScrollArea>
    </div>
  );
}
