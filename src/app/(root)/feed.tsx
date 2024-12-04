"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePost from "./(components)/create-post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from 'lucide-react';

type PostWithAttributes = Tables<"Post"> & {
  PostImage?: Tables<"PostImage">[];
  Comment?: Tables<"Comment">[];
};

// function to create a new comment on a post
const createComment = async (body: string,
                             Parent_post: number,
                             Author: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.from("Comment").insert([
    {
      body,
      Parent_post,
      Author,
    },]);
  if (error) {
    console.error("Error creating comment", error);
    return null;
  }
  return data;
}

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

function FeedPost({
  post,
  inline,
}: {
  post: PostWithAttributes;
  inline?: boolean;
}) {

  const [profileData, setProfileData] = useState<Tables<"UserProfile"> | null>(null);
  useEffect(() => {
    const fetchProfileData = async () => {
      const supabase = createClient();
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        return;
      }

      if (user?.user?.id) {
        const { data, error: profileError } = await supabase
          .from("UserProfile")
          .select("*")
          .eq("user_id", user.user.id as string)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        setProfileData(data as Tables<"UserProfile">);
      }
    };

    fetchProfileData();
  }, []);

  const formSchema = z.object({
    body: z
      .string()
      .min(2, {
        message: "Your comment must be at least 2 characters long.",
      })
      .max(240, {
        message: "Your comment cannot be more than 240 characters long.",
      }),
  });
    
  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        body: "",
      },
  });
  const [isCommenting, setIsCommenting] = useState(0);
  const {
    isError: isAuthorError,
    data: authorData,
    error: authorError,
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
  const {
    isError: isCommentError,
    data: commentAuthorData,
    error: commentError,
  } = useQuery({
    queryKey: ["comment_author", post.Comment],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .in("user_id", post.Comment?.map((comment) => comment.Author) || []);

      if (error) console.error("Error retrieving comment details", error);

      return data;
    },
  });

  if (isAuthorError)
    return (
      <div
        key={post.id}
        className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
      >
        <p>Error: {authorError.message}</p>
      </div>
    );

  if (isCommentError)
    return (
      <div
        key={post.id}
        className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
      >
        <p>Error: {commentError.message}</p>
      </div>
    );

  const focusOnPost = () => {
    setIsCommenting(post.id);
  };
  
  const unfocusOnPost = () => {
    setIsCommenting(0);
  };
  
  return (
    <div
      key={post.id}
      className={cn(
        !inline && "bg-card",
        "flex w-full flex-col gap-2 border-b px-8 py-4 shadow-lg",
      )}
    >
      <div className="flex items-center gap-2">
        {authorData ? (
          <Link href={`/user/${authorData.username}`} passHref>
            <Avatar className="border border-secondary">
              <AvatarImage
                src={
                  (authorData?.profile_picture_url &&
                    `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${authorData.profile_picture_url}`) ||
                  undefined
                }
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
      {post.PostImage && post.PostImage?.length > 0 && (
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
      {post.Comment && post.Comment?.length > 0 && (
        <>
          {post.Comment.map((comment) => {
            const commentAuthor = commentAuthorData?.find(
              (author) => author.user_id === comment.Author,
            );
            return (
              <div key={comment.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-neutral-400">
                    <Link href={`/user/${commentAuthor?.username}`} passHref>
                      <Avatar>
                        <AvatarImage
                          src={
                            commentAuthor?.profile_picture_url as
                              | string
                              | undefined
                          }
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {commentAuthor?.display_name.toString().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>
                  <div className="rounded-lg bg-neutral-700 p-2">
                    <div className="flex gap-2">
                      <p>{comment.body}</p>
                      <Link href={`/user/${commentAuthor?.username}`} passHref>
                        <p className="text-sm text-neutral-400">
                          @{commentAuthor?.username}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const body = formData.get("body") as string;
            const Author = String(profileData?.user_id);
            const Parent_post = post.id;
            await createComment(body, Parent_post, Author);
            form.reset()
          }}
        >
          <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-neutral-400">
                  <Avatar>
                    <AvatarImage
                      src={profileData?.profile_picture_url as string | undefined}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {profileData?.display_name.toString().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  </div>
                  <div className="bg-neutral-700 rounded-lg"
                       style={{padding: '.5px'}}>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                className="bg-transparent resize-none" 
                                onFocus={focusOnPost}
                                placeholder="Add a comment"
                                rows={1}
                                style={{ outline: 'none', border: 'none', height: 'auto', minHeight: '2rem' }} 
                                {...field}
                                onBlur={() => unfocusOnPost()} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                    {(isCommenting == post.id || form.watch("body").length > 0) && <button type="submit"><Send /></button>}
                </div>
              </div>
        </form>
      </Form>
    </div>
  );
}

export default function Feed({
  initalPosts,
  disableCreatePost,
  inline,
  feedUserId,
}: {
  initalPosts: PostWithAttributes[] | null;
  disableCreatePost?: boolean;
  inline?: boolean;
  feedUserId?: string;
}) {
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithAttributes[]>(initalPosts || []);

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

            if (
              !feedUserId ||
              (feedUserId && feedUserId === payload.new.creator)
            ) {
              setPosts((prev) => [payload.new as PostWithAttributes, ...prev]);
            } else
              console.log("New post was uploaded, but not by the feed user");
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
                  PostImage: post.PostImage?.filter(
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
                    payload.new as Tables<"PostImage">,
                  ],
                };
              }),
            );
          }
        },
      )
      .subscribe();

    const postCommentChannel = supabase
      .channel("public:comment")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Comment" },
        (payload) => {
          console.log(payload);

          if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.map((post) => {
                if (post.id !== payload.old.post) return post;

                return {
                  ...post,
                  Comments: post.Comment?.filter(
                    (comment) => comment.id !== payload.old.id,
                  ),
                };
              }),
            );
          }

          if (payload.eventType === "INSERT") {
            console.log("New Comment incoming!", payload.new);
            setPosts((prev) =>
              prev.map((post) => {
                if (post.id !== payload.new.Parent_post) return post;

                return {
                  ...post,
                  Comment: [
                    ...(post.Comment || []),
                    payload.new as Tables<"Comment">,
                  ],
                };
              }),
            );
          }

          if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((post) => {
                if (post.id !== payload.new.post) return post;

                return {
                  ...post,
                  Comment: [
                    ...(post.Comment || []),
                    payload.new as Tables<"Comment">,
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
      supabase.removeChannel(postCommentChannel);
    };
  }, [supabase]);

  if (!posts || posts.length === 0)
    return (
      <div
        className={cn(
          (!inline && "min-h-screen") || "max-h-full",
          "flex w-full items-center justify-center",
        )}
      >
        There are no posts yet. Create one!
        {!disableCreatePost && <CreatePost />}
      </div>
    );

  return (
    <div
      className={cn(
        (!inline && "h-screen bg-border") || "h-0 grow",
        "flex w-full flex-col items-center",
      )}
    >
      <ScrollArea
        className={cn(
          (!inline && "bg-card") || "h-full",
          "flex w-full flex-col",
        )}
      >
        {posts.map((post) => (
          <FeedPost post={post} key={post.id} inline={inline} />
        ))}
      </ScrollArea>

      {!disableCreatePost && <CreatePost />}
    </div>
  );
}
