import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/db";
import RatingStars from "@/components/RatingStars";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found | Sip Happens" };
  return {
    title: `${post.title} | Sip Happens`,
    description: post.excerpt || `Review of the espresso martini at ${post.bar_name}`,
  };
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-3xl font-bold text-espresso-900 mb-4 mt-8 first:mt-0">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-semibold text-espresso-800 mb-3 mt-8">{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} className="text-espresso-800 font-bold mb-4 leading-relaxed">{line.slice(2, -2)}</p>);
    } else if (line.trim() === "") {
      continue;
    } else {
      const rendered = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <p
          key={i}
          className="text-espresso-700 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );
    }
  }

  return elements;
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const date = new Date(post.created_at + "Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/reviews"
        className="inline-flex items-center text-sm text-espresso-500 hover:text-caramel transition-colors mb-8"
      >
        &larr; Back to all reviews
      </Link>

      {post.image_url && (
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-espresso-500 mb-4">
          <time>{date}</time>
          {post.location && (
            <>
              <span className="text-espresso-300">&#8226;</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {post.location}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-espresso-900 mb-4">
          {post.title}
        </h1>

        {post.bar_name && (
          <p className="text-lg font-medium text-caramel mb-4">{post.bar_name}</p>
        )}

        {(post.rating !== null || post.price !== null) && (
          <div className="flex flex-wrap items-center gap-4">
            {post.rating !== null && (
              <div className="flex items-center gap-3 p-4 bg-espresso-100 rounded-xl">
                <span className="text-sm font-medium text-espresso-600">Our Rating:</span>
                <RatingStars rating={post.rating} size="lg" />
              </div>
            )}
            {post.price !== null && (
              <div className="flex items-center gap-2 p-4 bg-espresso-100 rounded-xl">
                <span className="text-sm font-medium text-espresso-600">Price:</span>
                <span className="text-lg font-bold text-espresso-900">
                  {new Intl.NumberFormat("en", {
                    style: "currency",
                    currency: post.currency || "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }).format(post.price)}
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="prose max-w-none">
        {renderContent(post.content)}
      </div>

      {/* Navigation */}
      <nav className="mt-16 pt-8 border-t border-espresso-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPost ? (
          <Link
            href={`/reviews/${prevPost.slug}`}
            className="p-4 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-foam transition-all group"
          >
            <span className="text-xs text-espresso-400 block mb-1">&larr; Previous Review</span>
            <span className="font-semibold text-espresso-800 group-hover:text-caramel transition-colors">
              {prevPost.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextPost && (
          <Link
            href={`/reviews/${nextPost.slug}`}
            className="p-4 rounded-xl border border-espresso-200 hover:border-caramel hover:bg-foam transition-all text-right group"
          >
            <span className="text-xs text-espresso-400 block mb-1">Next Review &rarr;</span>
            <span className="font-semibold text-espresso-800 group-hover:text-caramel transition-colors">
              {nextPost.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
