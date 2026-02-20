import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface LocationData {
  place_id: string;
  formatted_address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  bar_name: string | null;
  location: string | null;
  location_data: LocationData | null;
  rating: number | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: number;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] as User | undefined;
}

export async function getAllPosts(publishedOnly = true): Promise<Post[]> {
  if (publishedOnly) {
    const rows = await sql`SELECT * FROM posts WHERE published = true ORDER BY created_at DESC`;
    return rows as Post[];
  }
  const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
  return rows as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
  return rows[0] as Post | undefined;
}

export async function getPostById(id: number): Promise<Post | undefined> {
  const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
  return rows[0] as Post | undefined;
}

export async function createPost(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  bar_name: string;
  location: string;
  location_data: LocationData | null;
  rating: number;
  price: number | null;
  currency: string;
  image_url: string;
  published: boolean;
  author_id: number;
}): Promise<Post> {
  const locationDataJson = post.location_data ? JSON.stringify(post.location_data) : null;
  const rows = await sql`
    INSERT INTO posts (title, slug, excerpt, content, bar_name, location, location_data, rating, price, currency, image_url, published, author_id)
    VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${post.content}, ${post.bar_name}, ${post.location}, ${locationDataJson}::jsonb, ${post.rating}, ${post.price}, ${post.currency}, ${post.image_url}, ${post.published}, ${post.author_id})
    RETURNING *
  `;
  return rows[0] as Post;
}

export async function updatePost(
  id: number,
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    bar_name: string;
    location: string;
    location_data: LocationData | null;
    rating: number;
    price: number | null;
    currency: string;
    image_url: string;
    published: boolean;
  }
): Promise<Post | undefined> {
  const locationDataJson = post.location_data ? JSON.stringify(post.location_data) : null;
  const rows = await sql`
    UPDATE posts SET
      title = ${post.title}, slug = ${post.slug}, excerpt = ${post.excerpt}, content = ${post.content},
      bar_name = ${post.bar_name}, location = ${post.location}, location_data = ${locationDataJson}::jsonb,
      rating = ${post.rating}, price = ${post.price}, currency = ${post.currency},
      image_url = ${post.image_url}, published = ${post.published}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as Post | undefined;
}

export async function deletePost(id: number): Promise<void> {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

export async function getRecentPosts(limit: number = 3): Promise<Post[]> {
  const rows =
    await sql`SELECT * FROM posts WHERE published = true ORDER BY created_at DESC LIMIT ${limit}`;
  return rows as Post[];
}

export async function getUniqueCountryCount(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(DISTINCT location_data->>'country') AS count
    FROM posts
    WHERE published = true AND location_data IS NOT NULL AND location_data->>'country' != ''
  `;
  return Number(rows[0].count);
}
