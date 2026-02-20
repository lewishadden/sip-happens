'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostForm from '@/components/PostForm';

export default function NewPostPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      setAuthorized(true);
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-espresso-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-sm text-espresso-500 hover:text-caramel transition-colors mb-6"
      >
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-espresso-900 mb-8">New Review</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-espresso-100">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
