import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/db";

export const metadata = {
  title: "All Reviews | Sip Happens",
  description: "Browse all our espresso martini reviews from bars around the world.",
};

export default async function ReviewsPage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-espresso-900">All Reviews</h1>
        <p className="text-espresso-500 mt-2">
          {posts.length} espresso martini {posts.length === 1 ? "review" : "reviews"} from around the world
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">&#9749;</span>
          <p className="text-espresso-500 text-lg">No reviews yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
