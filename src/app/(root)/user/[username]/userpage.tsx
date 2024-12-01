"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface UserPageProps {
  username: string;
}

// get user details from supabase
const getUserDetails = async (username: string) => {
  // connect to Supabase
  const supabase = createClient();
  const { data, error } = await supabase
    .from("UserProfile")
    .select("id, username, display_name, profile_picture_url, banner_url")
    .eq("username", username);
  if (error) {
    console.error("Error retrieving user details", error);
  }
  return data;
};

const UserPage: React.FC<UserPageProps> = ({ username }) => {
  const [userDetails, setUserDetails] = useState<{
    id: number;
    username: string;
    display_name: string;
    profile_picture_url: string | null;
    banner_url: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getUserDetails(username);
      setUserDetails(data ? data[0] : null); // Assuming the API returns an array
      setLoading(false);
    }
    fetchData();
  }, [username]);

  if (loading) {
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
    <div className="min-h-screen w-full bg-gray-100">
      {/* Header Section */}
      <div className="relative h-48 w-full sm:h-64">
        {banner_url ? (
          <img
            src={banner_url}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300">
            <p className="text-gray-500">No Banner</p>
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
        <h1 className="text-2xl font-semibold text-gray-800">{display_name}</h1>
        <p className="text-lg text-gray-600">@{username}</p>
      </div>
    </div>
  );
};

export default UserPage;
