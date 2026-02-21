import Image from 'next/image';
import Link from 'next/link';

import RatingStars from './RatingStars';

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  bar_name: string | null;
  location: string | null;
  rating: number | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  created_at: string;
}

export default function PostCard({
  title,
  slug,
  excerpt,
  bar_name,
  location,
  rating,
  price,
  currency,
  image_url,
  created_at,
}: PostCardProps) {
  const date = new Date(created_at + 'Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/reviews/${slug}`} className="group block">
      <article className="bg-espresso-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-espresso-100 group-hover:-translate-y-1">
        {image_url && (
          <div className="relative aspect-[16/10] overflow-hidden bg-espresso-100">
            <Image
              src={image_url}
              alt={title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-espresso-500 mb-2">
            <time>{date}</time>
            {location && (
              <>
                <span className="text-espresso-300">&#8226;</span>
                <span>{location}</span>
              </>
            )}
          </div>

          <h3 className="text-lg font-bold text-espresso-900 group-hover:text-espresso-600 transition-colors mb-2 line-clamp-2">
            {title}
          </h3>

          {bar_name && <p className="text-sm font-medium text-caramel mb-2">{bar_name}</p>}

          <div className="flex items-center gap-3">
            {rating !== null && <RatingStars rating={rating} size="sm" />}
            {price !== null && (
              <span className="text-sm font-medium text-espresso-500">
                {new Intl.NumberFormat('en', {
                  style: 'currency',
                  currency: currency || 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(price)}
              </span>
            )}
          </div>

          {excerpt && (
            <p className="mt-3 text-sm text-espresso-600 leading-relaxed line-clamp-3">{excerpt}</p>
          )}

          <div className="mt-4 text-sm font-semibold text-espresso-700 group-hover:text-caramel transition-colors">
            Read full review &rarr;
          </div>
        </div>
      </article>
    </Link>
  );
}
