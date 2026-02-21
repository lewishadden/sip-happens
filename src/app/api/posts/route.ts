import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth';
import { getAllPosts, createPost } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  const posts = await getAllPosts(!session);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    slug,
    excerpt,
    content,
    bar_name,
    location,
    location_data,
    rating,
    price,
    currency,
    image_url,
    published,
  } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
  }

  try {
    const post = await createPost({
      title,
      slug,
      excerpt: excerpt || '',
      content,
      bar_name: bar_name || '',
      location: location || '',
      location_data: location_data || null,
      rating: rating || 0,
      price: price || null,
      currency: currency || 'USD',
      image_url: image_url || '',
      published: !!published,
      author_id: session.userId,
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    if (message.includes('unique') || message.includes('duplicate')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
