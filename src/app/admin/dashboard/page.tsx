'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  slug: string;
  bar_name: string | null;
  location: string | null;
  rating: number | null;
  published: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-light-espresso/70 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-espresso">Dashboard</h1>
          {user && <p className="text-light-espresso mt-1">Welcome back, {user.name}</p>}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/posts/new"
            className="px-5 py-2.5 bg-caramel text-dark-espresso font-semibold rounded-xl hover:bg-light-espresso transition-all text-sm"
          >
            + New Review
          </Link>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 border border-light-espresso/40 text-light-espresso font-medium rounded-xl hover:bg-ivory-mist-dark transition-all text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl p-6 border border-ivory-mist-dark shadow-sm">
          <div className="text-3xl font-bold text-espresso">{posts.length}</div>
          <div className="text-sm text-light-espresso mt-1">Total Posts</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-ivory-mist-dark shadow-sm">
          <div className="text-3xl font-bold text-espresso">
            {posts.filter((p) => p.published).length}
          </div>
          <div className="text-sm text-light-espresso mt-1">Published</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-ivory-mist-dark shadow-sm">
          <div className="text-3xl font-bold text-espresso">
            {posts.filter((p) => !p.published).length}
          </div>
          <div className="text-sm text-light-espresso mt-1">Drafts</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ivory-mist-dark shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ivory-mist-dark">
          <h2 className="font-semibold text-espresso">All Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">&#127864;</span>
            <p className="text-light-espresso">No posts yet. Time to write your first review!</p>
          </div>
        ) : (
          <div className="divide-y divide-ivory-mist">
            {posts.map((post) => (
              <div
                key={post.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-ivory-mist/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-dark-espresso truncate">{post.title}</h3>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-ivory-mist-dark text-light-espresso'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-light-espresso/70 mt-1">
                    {post.bar_name && <span>{post.bar_name}</span>}
                    {post.bar_name && post.location && <span>&#8226;</span>}
                    {post.location && <span>{post.location}</span>}
                    {post.rating !== null && (
                      <>
                        <span>&#8226;</span>
                        <span className="text-caramel">&#9733; {post.rating}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-light-espresso border border-ivory-mist-dark rounded-lg hover:bg-ivory-mist transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
