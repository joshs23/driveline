'use client'

import { FC } from "react";
import { useParams } from "next/navigation";
import UserPage from "./userpage";

const ProfilePage: FC = () => {
  const { username } = useParams() as { username: string };

  if (!username) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <div>No username found in the route.</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <UserPage username={username} />
    </main>
  );
};

export default ProfilePage;