import UserPage from "./user-page";

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
    <main className="flex min-h-screen w-full items-center justify-center">
      <UserPage username={username} />
    </main>
  );
}
