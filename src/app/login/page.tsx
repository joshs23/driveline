'use client';

import { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuth } from "../hooks/useAuth";
import Login from "../login/login";

export default function LoginPage() {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    const handleLoginSuccess = () => {
        router.push('/');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <main className="flex items-center justify-center bg-purple-200 w-full min-h-screen">
            <Login onLoginSuccess={handleLoginSuccess} />
        </main>
    );
}
