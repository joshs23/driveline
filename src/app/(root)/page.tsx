'use client';

import { useState } from "react";
import Feed from "./feed";
import Login from "../login/page";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <main className="flex items-center justify-center bg-purple-200 w-full min-h-screen">
      {isLoggedIn ? <Feed /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </main>
  );
}
