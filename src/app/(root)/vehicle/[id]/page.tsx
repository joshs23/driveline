import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicleData } = await supabase
    .from("Vehicle")
    .select("*")
    .eq("id", id)
    .single();

  console.log(vehicleData);

  if (!vehicleData) return notFound();

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
