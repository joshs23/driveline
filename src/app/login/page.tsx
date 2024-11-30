'use client';

import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('./loginComponent'), { ssr: false });

export default function Page() {
    return <LoginPage />;
}
