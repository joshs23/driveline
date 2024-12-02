"use client";

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

// Function to delete a vehicle
async function deleteVehicle(vehicleId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Vehicle")
    .delete()
    .eq("id", vehicleId);

  if (error) {
    console.error("Error deleting vehicle:", error);
    return false;
  }
  return true;
}

// React component to display the list of vehicles
export default function Vehicles({ username }: { username: string }) {
  const [vehicles, setVehicles] = useState<
    | {
        id: string;
        make: string;
        model: string;
        year: number;
        color: string | null;
      }[]
    | null
  >(null);
  const [myVehicles, setMyVehicles] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for managing the confirmation modal
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getVehicles({ username });
      setVehicles(
        data?.map((vehicle) => ({ ...vehicle, id: vehicle.id.toString() })) ||
          [],
      );
      const authUser = await getAuthenticatedUser();
      const viewedUser = await getViewedUser({ username });
      setMyVehicles(authUser?.user?.id === viewedUser?.[0]?.user_id);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Handle vehicle deletion
  const handleDelete = async () => {
    if (vehicleToDelete) {
      const success = await deleteVehicle(vehicleToDelete);
      if (success) {
        // Update the list of vehicles by removing the deleted one
        setVehicles(
          vehicles?.filter((vehicle) => vehicle.id !== vehicleToDelete) || [],
        );
      }
      setShowConfirmDelete(false);
      setVehicleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setVehicleToDelete(null);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-800">Loading vehicles...</p>
      </div>
    );

  return (
    <div className="bg-gray-100 p-6">
      <div className="mb-6 flex items-center gap-x-4">
        <h1 className="text-3xl font-bold text-gray-800">Vehicles</h1>
        {myVehicles && <CreateVehicle />}
      </div>
      <ul className="flex flex-wrap gap-4">
        {vehicles?.map((vehicle) => (
          <li
            key={vehicle.id}
              className="relative flex w-fit items-center rounded-lg border border-gray-300 bg-secondary-foreground p-4 shadow-md"
          >
              <div>
            <div className="flex items-center justify-between">
              {/* Vehicle text info */}
              <div className="flex items-center">
                <p className="mr-4 text-lg font-semibold text-gray-800">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                {/* Delete Button */}
                {myVehicles && (
                  <button
                    onClick={() => {
                      setVehicleToDelete(vehicle.id);
                      setShowConfirmDelete(true);
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none"
                    aria-label="Delete vehicle"
                  >
                    <span className="text-xl font-bold">×</span>
                  </button>
                )}
              </div>
            </div>
            {/* Optional color text */}
            {vehicle.color && (
              <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
            )}
          </li>
        ))}
      </ul>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this vehicle?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
