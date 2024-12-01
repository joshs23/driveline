import UserPage from "./user-page";
import Vehicles from "./vehicles";
import CreateVehicle from "./createvehicle";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string | undefined }>;
}) {
  const { username } = await params;

  if (!username)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        No username found in the route.
      </div>
    );

  return (
    <main className="w-full flex-auto justify-center items-center min-h-screen bg-gray-100">
      <UserPage username={username} />
      <Vehicles username={username} />
    </main>
  );
}
