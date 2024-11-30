'use client';
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "../hooks/useAuth";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const {loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      onLoginSuccess();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else if (authData.user) {
      const { error: profileError } = await supabase
        .from('UserProfile')
        .insert([{ user_id: authData.user.id as `${string}-${string}-${string}-${string}-${string}`, username, display_name: displayName }]);
      if (profileError) {
        setError(profileError.message);
      } else {
        setError(null);
        onLoginSuccess();
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={isLogin ? handleLogin : handleRegister} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4">{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        {!isLogin && (
          <>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </>
        )}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
        <p className="mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:underline ml-1"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
}