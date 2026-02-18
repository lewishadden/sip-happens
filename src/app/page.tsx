import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getRecentPosts, getAllPosts, getUniqueCountryCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredPosts = await getRecentPosts(3);
  const totalReviews = (await getAllPosts()).length;
  const countryCount = await getUniqueCountryCount();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-espresso-900 text-cream overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-espresso-700)_0%,_var(--color-espresso-950)_70%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <span className="text-6xl md:text-8xl block mb-6">&#127864;</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Sip Happens
          </h1>
          <p className="text-lg md:text-xl text-espresso-300 max-w-2xl mx-auto mb-4">
            Reviewing espresso martinis around the globe, one sip at a time.
          </p>
          <p className="text-sm text-espresso-400 mb-8">
            {totalReviews} reviews and counting
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center px-8 py-3 bg-caramel text-espresso-950 font-semibold rounded-full hover:bg-espresso-300 transition-all shadow-lg hover:shadow-xl"
            >
              Browse Reviews
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-espresso-600 text-espresso-200 font-semibold rounded-full hover:border-caramel hover:text-caramel transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-espresso-900">
              Latest Reviews
            </h2>
            <p className="text-espresso-500 mt-1">Fresh from the glass</p>
          </div>
          <Link
            href="/reviews"
            className="text-sm font-semibold text-espresso-600 hover:text-caramel transition-colors hidden sm:block"
          >
            View all reviews &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/reviews"
            className="text-sm font-semibold text-espresso-600 hover:text-caramel transition-colors"
          >
            View all reviews &rarr;
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-espresso-900 text-cream">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-caramel mb-2">
                {totalReviews}
              </div>
              <div className="text-espresso-400 text-sm">Reviews Published</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-caramel mb-2">
                {countryCount}
              </div>
              <div className="text-espresso-400 text-sm">Countries Visited</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-caramel mb-2">
                &#8734;
              </div>
              <div className="text-espresso-400 text-sm">
                Espresso Martinis Consumed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-espresso-900 mb-4">
          Know a bar we should visit?
        </h2>
        <p className="text-espresso-500 max-w-xl mx-auto mb-8">
          We&apos;re always on the hunt for the next great espresso martini.
          Drop us a recommendation and we&apos;ll add it to our list.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center justify-center px-8 py-3 bg-espresso-800 text-cream font-semibold rounded-full hover:bg-espresso-700 transition-all"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}
