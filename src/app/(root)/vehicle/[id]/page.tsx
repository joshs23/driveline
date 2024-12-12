import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

// Page for the vehicle details unused in the starter app, for now just displays the vehicle details based on the id
// only accessible by typing URL directly
export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get the vehicle id from the params
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicleData } = await supabase
    .from("Vehicle")
    .select("*")
    .eq("id", id)
    .single();

  console.log(vehicleData);

  if (!vehicleData) return notFound();

  // Return the vehicle details
  return (
    <div className="container mx-auto py-8">
      {vehicleData && (
        <div className="flex flex-col items-start space-y-4">
          <h1 className="text-4xl font-bold">Vehicle Details</h1>
          <p>
            <strong>Make:</strong> {vehicleData.make}
          </p>
          <p>
            <strong>Model:</strong> {vehicleData.model}
          </p>
          <p>
            <strong>Year:</strong> {vehicleData.year}
          </p>
        </div>
      )}
    </div>
  );
}
