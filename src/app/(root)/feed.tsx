"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePost from "./(components)/create-post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

// PostWithAttributes is a type that extends the Post table with the PostImage and Comment tables
type PostWithAttributes = Tables<"Post"> & {
  PostImage?: Tables<"PostImage">[];
  Comment?: Tables<"Comment">[];
};

// Create a new comment in the Comment table
async function createComment(body: string, post_id: number, author_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("Comment").insert([
    {
      body,
      post_id,
      author_id,
    },
  ]);
  if (error) {
    console.error("Error creating comment", error);
    return null;
  }
  return data;
}

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

// Form rules for the comment form
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

// CommentSection is a component that displays the comments for a post and allows users to create new comments
function CommentSection({ post }: { post: PostWithAttributes }) {
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      body: "",
    },
  });

  const [isCommenting, setIsCommenting] = useState(0);

  // Get the author details for the comments
  const {
    data: commentAuthorData,
    isError: isCommentError,
    error: commentError,
  } = useQuery({
    queryKey: ["comment_users", post.Comment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .in("user_id", post.Comment?.map((comment) => comment.author_id) || []);

      if (error) console.error("Error retrieving comment details", error);

      return data;
    },
  });

  // Get the current user details
  const {
    data: currentUserData,
    isError: isCurrentUserError,
    error: currentUserError,
  } = useQuery({
    queryKey: ["client_user"],
    queryFn: async () => {
      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser || !authUser.user) return null;

      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .eq("user_id", authUser.user.id)
        .single();

      if (error) console.error("Error retrieving user details", error);

      return data;
    },
  });

  // Focus on the comment input when the user clicks on the post
  const focusOnPost = () => {
    setIsCommenting(post.id);
  };

  // Unfocus on the comment input when the user clicks away
  const unfocusOnPost = () => {
    setIsCommenting(0);
  };

  if (isCurrentUserError)
    return (
      <div
        key={post.id}
        className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
      >
        <p>Error: {currentUserError.message}</p>
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

  // Submit a new comment using createComment
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUserData) return;

    await createComment(values.body, post.id, currentUserData.user_id);
    form.reset();
  }

  // The comment section underneath each post, first contains any comments and then the comment form
  // TODO: Add pagination for comments
  return (
    <>
      {/* Display the comments */}
      {post.Comment && post.Comment?.length > 0 && (
        <>
          {post.Comment.map((comment) => {
            const commentAuthor = commentAuthorData?.find(
              (author) => author.user_id === comment.author_id,
            );
            return (
              <div key={comment.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-neutral-400">
                    <Link href={`/user/${commentAuthor?.username}`} passHref>
                      <Avatar>
                        <AvatarImage
                          src={
                            (commentAuthor?.profile_picture_url &&
                              `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${commentAuthor.profile_picture_url}`) ||
                            undefined
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
      {/* Add a comment form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-sm text-neutral-400">
                <Avatar>
                  <AvatarImage
                    src={
                      (currentUserData?.profile_picture_url &&
                        `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${currentUserData.profile_picture_url}`) ||
                      undefined
                    }
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {currentUserData?.display_name.toString().charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="rounded-lg bg-neutral-700">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="resize-none bg-transparent"
                            onFocus={focusOnPost}
                            placeholder="Leave a comment!"
                            style={{
                              outline: "none",
                              height: "auto",
                              minHeight: "2rem",
                            }}
                            {...field}
                            onBlur={() => unfocusOnPost()}
                          />
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {(isCommenting == post.id || form.watch("body").length > 0) && (
                <button type="submit">
                  <Send />
                </button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}

// Displays one post in the feed
function FeedPost({
  post,
  inline,
}: {
  post: PostWithAttributes;
  inline?: boolean;
}) {
  const [imageUrl, setImageUrl] = useState<string>();
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Get the author details for the post
  const {
    data: authorData,
    isError: isAuthorError,
    error: authorError,
  } = useQuery({
    queryKey: ["user_id", post.creator],
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

  // Handle when the user clicks on an image in the post
  function handleImageClick(url: string) {
    setImageUrl(url);
    setShowImageDialog(true);
  }

  if (isAuthorError)
    return (
      <div
        key={post.id}
        className="flex w-full flex-col gap-2 border-b bg-card p-4 shadow-lg"
      >
        <p>Error: {authorError.message}</p>
      </div>
    );

  // The post component displays the post body, images, and comments
  return (
    <>
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
          <div className="flex w-full flex-wrap gap-8">
            {post.PostImage?.map((image) => (
              <img
                key={image.id}
                src={`https://${projectId}.supabase.co/storage/v1/object/public/feed/${image.image_url}`}
                className="max-h-36 max-w-64 cursor-pointer object-cover"
                onClick={() =>
                  handleImageClick(
                    `https://${projectId}.supabase.co/storage/v1/object/public/feed/${image.image_url}`,
                  )
                }
              />
            ))}
          </div>
        )}
        <CommentSection post={post} />
      </div>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogPortal>
          <DialogContent className="m-auto size-auto p-0">
            <DialogTitle className="hidden" />
            <img
              src={imageUrl}
              alt="Image"
              className="size-full rounded-md object-cover"
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}

// Feed is the main component that displays the feed of all posts, it needs to be passed the initial posts 
// in order for the realtime updates to work
export default function Feed({
  initalPosts,
  disableCreatePost,
  inline,
  feedUserId,
  communityId,
}: {
  initalPosts: PostWithAttributes[] | null;
  disableCreatePost?: boolean;
  inline?: boolean;
  feedUserId?: string;
  communityId?: number;
}) {
  const [posts, setPosts] = useState<PostWithAttributes[]>(initalPosts || []);

  // subscribe to realtime updates for posts, post images, and comments
  useEffect(() => {
    const supabase = createClient();

    // subscribe to the post channel
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

            if (feedUserId && feedUserId == payload.new.creator) {
              console.log("New post was uploaded in the user's feed");
              setPosts((prev) => [payload.new as PostWithAttributes, ...prev]);
            } else if (communityId && communityId == payload.new.community) {
              console.log("Community post was uploaded");
              setPosts((prev) => [payload.new as PostWithAttributes, ...prev]);
            } else {
              console.log(
                "New post was uploaded, but not in the community and not in a user feed",
              );
              setPosts((prev) => [payload.new as PostWithAttributes, ...prev]);
            }
          }
        },
      )
      .subscribe();

    // subscribe to the post image channel
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

    // subscribe to the comment channel
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
                if (post.id !== payload.new.post_id) return post;

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
      // cleanup the channels when the component is unmounted to avoid unnecessary updates
      supabase.removeChannel(postChannel);
      supabase.removeChannel(postImageChannel);
      supabase.removeChannel(postCommentChannel);
    };
  }, [feedUserId, communityId]);

  // If there are no posts, display a message to create a post
  if (!posts || posts.length === 0)
    return (
      <div
        className={cn(
          (!inline && "min-h-screen") || "max-h-full",
          "flex w-full items-center justify-center",
        )}
      >
        There are no posts yet. Create one!
        {!disableCreatePost && <CreatePost communityId={communityId} />}
      </div>
    );

  // Display the posts in the feed and the create post form if the disableCreatePost prop is not set
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

      {!disableCreatePost && <CreatePost communityId={communityId} />}
    </div>
  );
}
