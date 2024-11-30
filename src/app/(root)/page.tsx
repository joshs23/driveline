'use client';

import { useAuth } from "../hooks/useAuth";
import Feed from "./feed";
import Login from "../login/login";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();
    
  if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="flex items-center justify-center bg-purple-200 w-full min-h-screen">
      {isLoggedIn ? <Feed /> : <Login onLoginSuccess={() => {}} />}
    </main>
  );
}
