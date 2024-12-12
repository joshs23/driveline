"use client";
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { notFound, redirect, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconFriends } from "@tabler/icons-react";

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

// sanitizes a file name to be used as an object key
export function sanitizeFileName(fileName: string): string {
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9!\-_.*'()]/g, "_") // Only allow permitted characters
    .replace(/\/+/g, "/") // Prevent multiple slashes from collapsing
    .replace(/^\//, "") // Remove leading slash
    .replace(/\/$/, ""); // Remove trailing slash

  if (sanitized.length === 0 || Buffer.byteLength(sanitized, "utf-8") > 1024) {
    throw new Error("File name is invalid or exceeds object key limits");
  }

  return sanitized;
}

// Get the currently authenticated user
async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error retrieving user details", error);
  }
  return data;
}

// User Page Banner
function Banner({ userDetails }: { userDetails: Tables<"UserProfile"> }) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Get the current user and set the current user id
  useEffect(() => {
    getCurrentUser().then((data) => setCurrentUserId(data?.user?.id));
  }, []);

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    uploadBanner(event.target.files[0]);
  };

  // Upload a new banner image
  async function uploadBanner(bannerImage: File) {
    if (!bannerImage) return;

    // Show a loading toast
    const toastId = toast.loading("Uploading new banner...", {
      position: "top-right",
    });

    // Upload the image to the storage bucket
    const supabase = createClient();
    const { data: imageData, error } = await supabase.storage
      .from("avatars")
      .upload(
        `${userDetails.id}/banner/${sanitizeFileName(bannerImage.name)}`,
        bannerImage,
        {
          upsert: true,
        },
      );

    if (error) {
      toast.error("Error uploading image! - " + error.message, {
        id: toastId,
      });
      console.error("Error uploading image:", error, imageData);
      return;
    }

    // Update the user's profile with the new banner image
    if (imageData) {
      await supabase
        .from("UserProfile")
        .update({
          banner_url: imageData.path,
        })
        .eq("user_id", userDetails.user_id);
    }

    toast.success("Banner has been updated!", {
      id: toastId,
      className: "bg-green-600",
    });

    // Invalidate the user profile queries cache
    queryClient.invalidateQueries({
      queryKey: ["username", userDetails.username],
    });

    // Invalidate the user id queries cache
    queryClient.invalidateQueries({
      queryKey: ["user_id", userDetails.user_id],
    });

    queryClient.invalidateQueries({ queryKey: ["client_user"] });

    redirect(pathname);
  }

  // Render the banner image or a placeholder if there is no banner image
  return (
    <div
      className={cn(
        currentUserId &&
          currentUserId == userDetails.user_id &&
          "cursor-pointer",
        "flex h-full w-full items-center justify-center bg-secondary/50",
      )}
      onClick={() => {
        if (!currentUserId || currentUserId !== userDetails.user_id) return;
        fileInputRef.current?.click();
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBannerChange}
        className="hidden"
      />
      {userDetails.banner_url ? (
        <>
          <img
            src={`https://${projectId}.supabase.co/storage/v1/object/public/avatars/${userDetails.banner_url}`}
            alt="Banner"
            className="h-full w-full object-cover object-center"
          />
        </>
      ) : (
        <p className="font-bold text-muted-foreground">No Banner</p>
      )}
    </div>
  );
}

// User Page Profile Picture
function ProfilePicture({
  userDetails,
}: {
  userDetails: Tables<"UserProfile">;
}) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Get the current user and set the current user id
  useEffect(() => {
    getCurrentUser().then((data) => setCurrentUserId(data?.user?.id));
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    uploadAvatar(event.target.files[0]);
  };

  // Upload a new avatar image
  async function uploadAvatar(avatarImage: File) {
    if (!avatarImage) return;

    // Show a loading toast
    const toastId = toast.loading("Uploading new avatar...", {
      position: "top-right",
    });

    // Upload the image to the storage bucket
    const supabase = createClient();
    const { data: imageData, error } = await supabase.storage
      .from("avatars")
      .upload(
        `${userDetails.id}/avatar/${sanitizeFileName(avatarImage.name)}`,
        avatarImage,
        {
          upsert: true,
        },
      );

    if (error) {
      toast.error("Error uploading image! - " + error.message, {
        id: toastId,
      });
      console.error("Error uploading image:", error);
      return;
    }

    // Update the user's profile with the new avatar image
    if (imageData) {
      await supabase
        .from("UserProfile")
        .update({
          profile_picture_url: imageData.path,
        })
        .eq("user_id", userDetails.user_id);
    }

    toast.success("Avatar has been updated!", {
      id: toastId,
      className: "bg-green-600",
    });

    queryClient.invalidateQueries({
      queryKey: ["username", userDetails.username],
    });

    queryClient.invalidateQueries({
      queryKey: ["user_id", userDetails.user_id],
    });

    queryClient.invalidateQueries({ queryKey: ["client_user"] });

    redirect(pathname);
  }

  // Render the profile picture or a placeholder if there is no profile picture
  return (
    <div
      className={cn(
        currentUserId &&
          currentUserId == userDetails.user_id &&
          "cursor-pointer",
        "absolute -bottom-16 left-1/2 h-32 w-32 -translate-x-1/2 transform sm:h-40 sm:w-40",
      )}
      onClick={() => {
        if (!currentUserId || currentUserId !== userDetails.user_id) return;
        fileInputRef.current?.click();
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {userDetails.profile_picture_url ? (
        <img
          src={`https://${projectId}.supabase.co/storage/v1/object/public/avatars/${userDetails.profile_picture_url}`}
          alt="Profile Picture"
          className="h-full w-full rounded-full border-4 border-border bg-secondary object-cover shadow-md"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full border-4 
                        border-border bg-secondary font-semibold shadow-md">
          No Profile Pic
        </div>
      )}
    </div>
  );
}

// User Page
export default function UserPage({ username }: { username: string }) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [friendRequestStatus, setFriendRequestStatus] = useState<string>();
  const [showFriendButton, setShowFriendButton] = useState({
    show: false,
    color: "",
    message: "",
  });

  // Get the current user and set the current user id
  useEffect(() => {
    getCurrentUser().then((data) => setCurrentUserId(data?.user?.id));
  }, []);

  // Get the user details for the given username
  const { isPending, data: userDetails } = useQuery({
    queryKey: ["username", username],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .eq("username", username)
        .single();

      if (error) console.error("Error retrieving user details", error);

      return data;
    },
  });

  // Check the friend request status between the current user and the user being viewed
  useEffect(() => {
    if (currentUserId && userDetails?.user_id) {
      const supabase = createClient();
      supabase
        .from("Friends")
        .select("*")
        .eq("user_id1", currentUserId)
        .eq("user_id2", userDetails.user_id)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching friend request status:", error);
            return;
          }
          // If there is a friend request, set the status to pending or accepted
          if (data.length > 0) {
            if (data[0].accepted) {
              setFriendRequestStatus("accepted");
            } else {
              setFriendRequestStatus("pending");
            }
          // If there is no friend request, check the inverse relationship as well
          } else {
            supabase
              .from("Friends")
              .select("*")
              .eq("user_id1", userDetails.user_id)
              .eq("user_id2", currentUserId)
              .then(({ data, error }) => {
                if (error) {
                  console.error("Error fetching friend request status:", error);
                  return;
                }
                // If there is a friend request, set the status to pending or accepted
                if (data.length > 0) {
                  if (data[0].accepted) {
                    setFriendRequestStatus("accepted");
                  } else {
                    setFriendRequestStatus("pending");
                  }
                } else {
                  setFriendRequestStatus("none");
                }
              });
          }
        });
    }
  }, [currentUserId, userDetails, friendRequestStatus]);

  // Set the friend button status based on the friend request status
  useEffect(() => {
    if (friendRequestStatus === "accepted") {
      setShowFriendButton({ show: false, color: "", message: "" });
    } else if (friendRequestStatus === "pending") {
      setShowFriendButton({
        show: true,
        color: "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-600/10",
        message: "Pending",
      });
    } else if (friendRequestStatus === "none") {
      setShowFriendButton({
        show: true,
        color: "bg-red-500/20 text-red-300 hover:bg-red-600/10",
        message: "Add Friend",
      });
    }
    // If the user is viewing their own profile, hide the friend button
    if (currentUserId == userDetails?.user_id) {
      setShowFriendButton({ show: false, color: "", message: "" });
    }
  }, [friendRequestStatus]);

  // if the query is pending, show a loading spinner
  if (isPending)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle size={32} strokeWidth={2.75} className="animate-spin" />
      </div>
    );

  if (!userDetails) notFound();

  // Send a friend request to the user being viewed
  const requestFriend = (userDetails: Tables<"UserProfile">) => async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Friends")
      .insert([
        {
          user_id1: currentUserId,
          user_id2: userDetails.user_id,
          accepted: false,
        },
      ])
      .single();

    if (error) {
      console.error("Error sending friend request:", error);
      return;
    } else {
      // Show a success toast and set the friend request status to pending
      toast.success("Friend request sent!");
      setFriendRequestStatus("pending");
    }
  };

  // Render the user page with the user's details
  return (
    <div className="max-h-full w-full overflow-clip">
      {/* Header Section */}
      <div className="relative h-[19rem] w-full border-b border-zinc-600">
        <Banner userDetails={userDetails} />
        <ProfilePicture userDetails={userDetails} />
      </div>
      {/* User Info Section */}
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">{userDetails.display_name}</h1>
        <p className="text-lg">@{username}</p>
        {/* Show the friend button if users are not already friends */}
        {showFriendButton.show ? (
          <div className="pt-2">
            <Button
              className={`text-lg font-semibold ${showFriendButton.color}`}
              onClick={
                friendRequestStatus == "none"
                  ? requestFriend(userDetails)
                  : () => {}
              }
            >{/* Show the appropriate message on the friend button */}
              <IconFriends /> {showFriendButton.message}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
