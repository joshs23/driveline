"use client";
import { useEffect, useState } from "react";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
  }
  return data;
}

async function insertVehicle(vehicle: {
  make: string;
  model: string;
  year: number;
  color: string;
}) {
  const supabase = await createClient();
  const user = await getUser();
  const { data, error } = await supabase
    .from("Vehicle")
    .insert([
      {
        owner: String(user?.user?.id),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
      },
    ])
    .select();
  if (error) {
    console.error("Error inserting Vehicle:", error);
  }
  return data;
}

export default function CreateVehicle() {
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: 0,
    color: "",
  });

  // handle submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // insert the row
    insertVehicle(vehicle);
    // Reset the input after submission
    setVehicle({ make: "", model: "", year: 0, color: "" });
    window.location.reload();  // Just refreshing for now instead of subscribing to changes.
  };

  return (
    <div className="flex w-full items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Add a New Vehicle
        </h1>

        {/* Make Field */}
        <div className="mb-4">
          <label
            htmlFor="make"
            className="block text-sm font-medium text-gray-700"
          >
            Make <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="make"
            value={vehicle.make}
            onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
            placeholder="Enter vehicle make"
            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Model Field */}
        <div className="mb-4">
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="model"
            value={vehicle.model}
            onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
            placeholder="Enter vehicle model"
            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Year Field */}
        <div className="mb-4">
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="year"
            value={vehicle.year === 0 ? "" : vehicle.year} // Show blank if 0
            onChange={(e) =>
              setVehicle({ ...vehicle, year: parseInt(e.target.value) || 0 })
            }
            placeholder="Enter vehicle year"
            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Color Field (Optional) */}
        <div className="mb-4">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700"
          >
            Color (Optional)
          </label>
          <input
            type="text"
            id="color"
            value={vehicle.color}
            onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
            placeholder="Enter vehicle color"
            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}