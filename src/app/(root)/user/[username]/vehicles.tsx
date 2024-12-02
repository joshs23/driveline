"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CreateVehicle from "./createvehicle";
import { Plus, X } from "lucide-react";
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
import { set } from "zod";

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

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Error getting authenticated user:", authError);
  }
  return authUser;
}

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
  }, [username]);

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
    <Dialog
      open={showConfirmDelete}
      onOpenChange={(open) => {
        if (!open) {
          setShowConfirmDelete(false);
          setVehicleToDelete(null);
        }
      }}
    >
      <div className="p-6">
        <div className="mb-6 flex items-center gap-x-4">
          <h1 className="text-3xl font-bold">Vehicles</h1>
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
                  <div className="flex items-center">
                    <p className="mr-4 text-lg font-semibold text-gray-800">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
                {vehicle.color && (
                  <p className="text-sm text-secondary">
                    Color: {vehicle.color}
                  </p>
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
                    className="my-auto size-8 cursor-pointer rounded-full bg-primary p-1 text-primary-foreground shadow-md"
                  />
                </DialogTrigger>
              )}
            </li>
          ))}
        </ul>

        {/* Confirmation Modal */}
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
              <Button
                onClick={cancelDelete}
                className="rounded-md bg-zinc-200 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
