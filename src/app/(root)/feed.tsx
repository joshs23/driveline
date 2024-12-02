"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePost from "./(components)/create-post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link"; // Import Link component for navigation

function FeedPost({
  post,
}: {
  post: Database["public"]["Tables"]["Post"]["Row"];
}) {
  const {
    isError,
    data: authorData,
    error,
  } = useQuery({
    queryKey: ["author_id", post.creator],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .eq("user_id", post.creator)
        .single();

      if (error) console.error("Error retrieving user details", error);

      return data;
    },
  });

  if (isError)
    return (
      <div
        key={post.id}
        className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
      >
        <p>Error: {error.message}</p>
      </div>
    );

  return (
    <div
      key={post.id}
      className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
    >
      <div className="flex items-center gap-2">
        {authorData ? (
          <Link href={`/user/${authorData.username}`} passHref>
            <Avatar>
              <AvatarImage
                src={authorData?.profile_picture_url as string | undefined}
                alt="Avatar"
              />
              <AvatarFallback className="bg-neutral-200">
                {authorData?.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Skeleton className="h-10 w-10 rounded-full" />
        )}
        <div className="flex gap-2">
          {authorData ? (
            <Link href={`/user/${authorData.username}`} passHref>
              <p className="font-bold">{authorData?.display_name}</p>
            </Link>
          ) : (
            <Skeleton className="h-4 w-40" />
          )}
          {authorData ? (
            <Link href={`/user/${authorData.username}`} passHref>
              <p className="text-sm text-neutral-400">
                @{authorData?.username}
              </p>
            </Link>
          ) : (
            <Skeleton className="h-4 w-20" />
          )}
        </div>
      </div>
      <p className="leading-7">{post.body}</p>
    </div>
  );
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
    <div className="relative flex h-screen w-full flex-col items-center bg-border">
      <ScrollArea className="flex w-full flex-col bg-card">
        {posts.map((post) => (
          <FeedPost post={post} key={post.id} />
        ))}
      </ScrollArea>
      <CreatePost />
    </div>
  );
}
