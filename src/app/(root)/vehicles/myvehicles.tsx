import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Function to get the authenticated user
async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
  }
  return data;
}

// Function to fetch the user's vehicles
async function getVehicles() {
  const supabase = await createClient();
  const user = await getUser();
  const { data, error } = await supabase
    .from("Vehicle")
    .select("id, make, model, year, color")
    .eq("owner", String(user?.user?.id));
  if (error) {
    console.error("Error retrieving Vehicle:", error);
  }
  return data;
}

// React component to display the list of vehicles
export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<
    { make: string; model: string; year: number; color: string | null }[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getVehicles();
      setVehicles(data || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">Loading your vehicles...</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-800">You don&apos;t have any vehicles listed.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">My Vehicles</h1>
      <ul className="space-y-4">
        {vehicles.map((vehicle, index) => (
          <li
            key={index}
            className="rounded-lg border border-gray-300 bg-white p-4 shadow-md"
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
    </div>
  );
}