/*
 * UserButtonDetails fetches the current user's profile details from Supabase
 * and displays them in a dropdown menu trigger. 
 * It shows the user's avatar, display name, and username.
 * It is used in the navbar to display the user's profile details.
 */

"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1].split(".")[0];

export default function UserButtonDetails() {
  const supabase = createClient();

  const { data: currentUserData } = useQuery({
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

  if (!currentUserData) return null;

  return (
    <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md border px-4 py-2 shadow-lg">
      <Avatar className="border-2 shadow-md">
        <AvatarImage
          src={
            (currentUserData?.profile_picture_url &&
              `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${currentUserData.profile_picture_url}`) ||
            undefined
          }
          alt="Avatar"
        />
        <AvatarFallback>
          {currentUserData.display_name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-left">
        <p className="font-bold">{currentUserData.display_name}</p>
        <p className="text-sm">@{currentUserData.username}</p>
      </div>
    </DropdownMenuTrigger>
  );
}
