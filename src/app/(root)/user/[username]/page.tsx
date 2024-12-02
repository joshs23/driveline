import UserPage from "./user-page";
import Vehicles from "./vehicles";

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
    <main className="min-h-screen w-full flex-auto items-center justify-center bg-secondary">
      <UserPage username={username} />
      <Vehicles username={username} />
    </main>
  );
}
