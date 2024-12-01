'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CreateVehicle from "./createvehicle";

// Function to get the authenticated user
async function getViewedUser({ username }: { username: string }) {
  const supabase = createClient();

  // Get the vehicles for this user
  const { data, error } = await supabase
    .from("UserProfile")
    .select("user_id")
    .eq("username", username);
  if (error) {
    console.error("Error retrieving user details", error);
  }

  return data;
}

async function getAuthenticatedUser() {
    const supabase = createClient();
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Error getting authenticated user:", authError);
    }
    return authUser;
}

// Function to fetch the user's vehicles
async function getVehicles({ username }: { username: string }) {
  const supabase = await createClient();
  const user = await getViewedUser({ username });
  if (!user || user.length === 0) {
    console.error("User not found");
    return null;
  }

  const { data, error } = await supabase
    .from("Vehicle")
    .select("id, make, model, year, color")
    .eq("owner", user[0].user_id);
  if (error) {
    console.error("Error retrieving vehicles", error);
  }
  return data;
}

// React component to display the list of vehicles
export default function Vehicles({ username }: { username: string }) {
  const [vehicles, setVehicles] = useState<
    { make: string; model: string; year: number; color: string | null }[] | null
  >(null);
  const [myVehicles, setMyVehicles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getVehicles({ username });
      setVehicles(data || []);
      const authUser = await getAuthenticatedUser();
      const viewedUser = await getViewedUser({ username });
      setMyVehicles(authUser?.user?.id === viewedUser?.[0]?.user_id);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">Loading vehicles...</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">No vehicles listed.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Vehicles</h1>
      <ul className="flex flex-wrap gap-4">
        {vehicles.map((vehicle, index) => (
          <li
            key={index}
            className="rounded-lg border border-gray-300 bg-white p-4 shadow-md w-fit"
          >
            <p className="text-lg font-semibold text-gray-800">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            {vehicle.color && (
              <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
            )}
          </li>
        ))}
      </ul>
      <div className="p-8">
        {myVehicles && <CreateVehicle />}
      </div>
    </div>
  );
}