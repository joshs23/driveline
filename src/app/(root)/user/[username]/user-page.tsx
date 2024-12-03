"use client";
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { notFound, redirect, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error retrieving user details", error);
  }
  return data;
}

function Banner({ userDetails }: { userDetails: Tables<"UserProfile"> }) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  //const [bannerImage, setBannerImage] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    getCurrentUser().then((data) => setCurrentUserId(data?.user?.id));
  }, []);

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    //setBannerImage(event.target.files?.[0]);
    uploadBanner(event.target.files[0]);
  };

  async function uploadBanner(bannerImage: File) {
    if (!bannerImage) return;

    const supabase = createClient();
    const { data: imageData, error } = await supabase.storage
      .from("avatars")
      .upload(`${userDetails.id}/banner/${bannerImage.name}`, bannerImage, {
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image:", error, imageData);
      return;
    }

    if (imageData) {
      await supabase
        .from("UserProfile")
        .update({
          banner_url: imageData.path,
        })
        .eq("user_id", userDetails.user_id);
    }

    queryClient.invalidateQueries({
      queryKey: ["username", userDetails.username],
    });

    redirect(pathname);
  }

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

//somizlnspycsfofvmxjs.supabase.co/storage/v1/object/public/avatars/6/Tuning-Car-PNG-Image-File.png

export default function UserPage({ username }: { username: string }) {
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

  if (isPending)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle size={32} strokeWidth={2.75} className="animate-spin" />
      </div>
    );

  if (!userDetails) notFound();

  const { display_name, profile_picture_url } = userDetails;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="relative h-[25rem] w-full border-b border-zinc-600">
        <Banner userDetails={userDetails} />
        <div className="absolute -bottom-16 left-1/2 h-32 w-32 -translate-x-1/2 transform sm:h-40 sm:w-40">
          {profile_picture_url ? (
            <img
              src={profile_picture_url}
              alt="Profile"
              className="h-full w-full rounded-full border-4 border-white object-cover shadow-md"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-gray-300 shadow-md">
              <p className="text-gray-500">No Profile Pic</p>
            </div>
          )}
        </div>
      </div>
      {/* User Info Section */}
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-semibold">{display_name}</h1>
        <p className="text-lg">@{username}</p>
      </div>
    </div>
  );
}
