"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostForm from "@/components/PostForm";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  bar_name: string;
  location: string;
  rating: number;
  price: number | null;
  currency: string | null;
  image_url: string;
  published: boolean;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/admin/login");
        return;
      }

      const postRes = await fetch(`/api/posts/${id}`);
      if (!postRes.ok) {
        router.push("/admin/dashboard");
        return;
      }

      const postData = await postRes.json();
      setPost(postData);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading || !post) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-espresso-400 text-lg">Loading post...</div>
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
      <h1 className="text-3xl font-bold text-espresso-900 mb-8">Edit Review</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-espresso-100">
        <PostForm
          mode="edit"
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content: post.content,
            bar_name: post.bar_name || "",
            location: post.location || "",
            rating: post.rating || 0,
            price: post.price,
            currency: post.currency || "USD",
            image_url: post.image_url || "",
            published: !!post.published,
          }}
        />
      </div>
    </div>
  );
}
