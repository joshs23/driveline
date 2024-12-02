"use client";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
  const {
    isPending,
    isError,
    data: userDetails,
    error,
  } = useQuery({
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

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">Loading profile...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">User not found.</p>
      </div>
    );
  }

  const { display_name, profile_picture_url, banner_url } = userDetails;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="relative h-48 w-full border-b border-zinc-600 sm:h-64">
        {banner_url ? (
          <img
            src={banner_url}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/50">
            <p>No Banner</p>
          </div>
        )}
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
