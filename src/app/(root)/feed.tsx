"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePost from "./(components)/create-post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type PostWithImages = Database["public"]["Tables"]["Post"]["Row"] & {
  PostImage: Database["public"]["Tables"]["PostImage"]["Row"][];
};

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

function FeedPost({ post }: { post: PostWithImages }) {
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
              <AvatarFallback>
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
      {post.PostImage?.length > 0 && (
        <div className="flex w-full gap-8">
          {post.PostImage?.map((image) => (
            <img
              key={image.id}
              src={`https://${projectId}.supabase.co/storage/v1/object/public/feed/${image.image_url}`}
              className="max-h-36 max-w-64 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Feed({
  initalPosts,
}: {
  initalPosts: PostWithImages[] | null;
}) {
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithImages[]>(initalPosts || []);

  useEffect(() => {
    const postChannel = supabase
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
          }

          if (payload.eventType === "INSERT") {
            console.log("New post incoming!", payload.new);
            setPosts((prev) => [payload.new as PostWithImages, ...prev]);
          }
        },
      )
      .subscribe();

    const postImageChannel = supabase
      .channel("public:postimage")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "PostImage" },
        (payload) => {
          console.log(payload);

          if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.map((post) => {
                if (post.id !== payload.old.post) return post;

                return {
                  ...post,
                  PostImage: post.PostImage.filter(
                    (image) => image.id !== payload.old.id,
                  ),
                };
              }),
            );
          }

          if (payload.eventType === "INSERT") {
            console.log("New image incoming!", payload.new);
            setPosts((prev) =>
              prev.map((post) => {
                if (post.id !== payload.new.post) return post;

                return {
                  ...post,
                  PostImage: [
                    ...(post.PostImage || []),
                    payload.new as Database["public"]["Tables"]["PostImage"]["Row"],
                  ],
                };
              }),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(postImageChannel);
    };
  }, [supabase]);

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
