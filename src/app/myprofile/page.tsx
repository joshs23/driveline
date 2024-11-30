'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";

export default function MyProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<{ display_name: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('UserProfile')
          .select('display_name, username')
          .eq('user_id', user.id)
          .single();
        if (error) {
          setError(error.message);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      {profile ? (
        <>
          <p className="text-xl mb-2">Display Name: {profile.display_name}</p>
          <p className="text-xl">Username: {profile.username}</p>
        </>
      ) : (
        <p>No profile information available.</p>
      )}
    </div>
  );
}