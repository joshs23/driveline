"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CreateVehicle from "./create-vehicle";
import { LoaderCircle, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

// Return the username of the profile we are viewing
async function getViewedUser({ username }: { username: string }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("UserProfile")
    .select("user_id")
    .eq("username", username);
  if (error) {
    console.error("Error retrieving user details", error);
  }

  return data;
}

// Get the currently authenticated user
async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Error getting authenticated user:", authError);
  }
  return authUser;
}

// Retreive all the vehicles for the viewed user
async function getVehicles({ username }: { username: string }) {
  const supabase = createClient();
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

// Delete a user's specific vehicle by vehicleID from the database
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

// vehicles component for displaying, adding, and deleting vehicles on the user page
export default function Vehicles({ username }: { username: string }) {
  const queryClient = useQueryClient();
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
  const [myVehicles, setMyVehicles] = useState(false); // If we're viewing our own vehicles or not
  const [loading, setLoading] = useState(true);

  // States for managing the confirmation modal
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {

      // Fetch the vehicles for the user
      const data = await getVehicles({ username });
      setVehicles(
        data?.map((vehicle) => ({ ...vehicle, id: vehicle.id.toString() })) ||
          [],
      );
      // Check if the user is viewing their own profile
      const authUser = await getAuthenticatedUser();
      const viewedUser = await getViewedUser({ username });
      setMyVehicles(authUser?.user?.id === viewedUser?.[0]?.user_id);
      setLoading(false);
    }

    fetchData();
  }, [username]);

  // handler to call deleteVehicle and update the UI
  const handleDelete = async () => {
    if (vehicleToDelete) {
      const success = await deleteVehicle(vehicleToDelete);
      if (success) {
        setVehicles(
          vehicles?.filter((vehicle) => vehicle.id !== vehicleToDelete) || [],
        );
      }
      setShowConfirmDelete(false);
      setVehicleToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["client_vehicles"] });
    }
  };

  // 
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setVehicleToDelete(null);
  };

  if (loading)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle size={32} strokeWidth={2.75} className="animate-spin" />
      </div>
    );

  return (
    <Dialog
      open={showConfirmDelete}
      onOpenChange={(open) => {
        if (!open) {
          setShowConfirmDelete(false);
          setVehicleToDelete(null);
        }
      }}
    >
      {/* Vehicles Section Header */}
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center gap-x-4">
          <h1 className="text-3xl font-bold">Vehicles</h1>

          { /* Add Vehicle Button */}
          {myVehicles && <CreateVehicle />}
        </div>
          
          {/* Vehicles List */}
        <ul className="flex flex-wrap gap-2">
          {vehicles?.map((vehicle) => (
            <li
              key={vehicle.id}
              className="relative flex w-fit items-center rounded-lg border bg-card p-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                  { /* Display Year Make Model */}
                    <p className="mr-4 text-lg font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
                { /* Conditionally Display Color */}
                {vehicle.color && (
                  <p className="text-sm">Color: {vehicle.color}</p>
                )}
              </div>

              {/* Delete Button */}
              {myVehicles && (
                <DialogTrigger asChild>
                  <X
                    onClick={() => {
                      setShowConfirmDelete(true);
                      setVehicleToDelete(vehicle.id);
                    }}
                    className="my-auto text-red-400 size-6 cursor-pointer rounded-full bg-primary/20 p-1 shadow-md transition-colors hover:bg-primary/10"
                  />
                </DialogTrigger>
              )}
            </li>
          ))}
        </ul>

        {/* Confirmation Modal for Deletion*/}
        <DialogContent className="w-full max-w-sm rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="mb-4 text-xl font-semibold">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="mb-4 text-sm">
              Are you sure you want to delete this vehicle?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <DialogClose asChild>
              {/* Cancel Deletion */}
              <Button
                onClick={cancelDelete}
                className="rounded-md px-4 py-2 transition-colors hover:bg-primary/60"
              >
                Cancel
              </Button>
            </DialogClose>
            {/* Confirm Deletion */}
            <Button
              onClick={handleDelete}
              className="rounded-md px-4 py-2 transition-colors hover:bg-primary/60"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
