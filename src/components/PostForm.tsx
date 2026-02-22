'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import LocationSearch, { type LocationData } from './LocationSearch';

interface PostFormProps {
  initialData?: {
    id?: number;
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
  };
  mode: 'create' | 'edit';
}

export default function PostForm({ initialData, mode }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [barName, setBarName] = useState(initialData?.bar_name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [locationData, setLocationData] = useState<LocationData | null>(
    initialData?.location_data ?? null
  );
  const [rating, setRating] = useState(String(initialData?.rating ?? ''));
  const [price, setPrice] = useState(String(initialData?.price ?? ''));
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [published, setPublished] = useState(initialData?.published || false);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (mode === 'create') {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const body = {
      title,
      slug,
      excerpt,
      content,
      bar_name: barName,
      location,
      location_data: locationData,
      rating: rating === '' ? 0 : parseFloat(rating),
      price: price === '' ? null : parseFloat(price),
      currency,
      image_url: imageUrl,
      published,
    };

    try {
      const url = mode === 'create' ? '/api/posts' : `/api/posts/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-espresso mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
            placeholder="The Perfect Pour at Bar Termini"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-espresso mb-2">
            URL Slug *
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso font-mono text-sm"
            placeholder="the-perfect-pour-at-bar-termini"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="bar_name" className="block text-sm font-medium text-espresso mb-2">
            Bar / Venue Name
          </label>
          <input
            id="bar_name"
            type="text"
            value={barName}
            onChange={(e) => setBarName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
            placeholder="Bar Termini"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-espresso mb-2">
            Location
          </label>
          <LocationSearch
            initialValue={initialData?.location || ''}
            initialLocationData={initialData?.location_data}
            onChange={({ display, data }) => {
              setLocation(display);
              setLocationData(data);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-espresso mb-2">
            Rating (0-5)
          </label>
          <input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
          />
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-espresso mb-2">
            Image URL
          </label>
          <input
            id="image_url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-espresso mb-2">
            Price
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
            placeholder="14.00"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-espresso mb-2">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso bg-white"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (&euro;)</option>
            <option value="GBP">GBP (&pound;)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="NZD">NZD (NZ$)</option>
            <option value="JPY">JPY (&yen;)</option>
            <option value="CHF">CHF (Fr)</option>
            <option value="SEK">SEK (kr)</option>
            <option value="NOK">NOK (kr)</option>
            <option value="DKK">DKK (kr)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="HKD">HKD (HK$)</option>
            <option value="THB">THB (&thorn;)</option>
            <option value="MXN">MXN (Mex$)</option>
            <option value="BRL">BRL (R$)</option>
            <option value="ZAR">ZAR (R)</option>
            <option value="INR">INR (&rupee;)</option>
            <option value="RUB">RUB (&ruble;)</option>
            <option value="AED">AED (AED)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-espresso mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso resize-y"
          placeholder="A short summary that appears on the listing page..."
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-espresso mb-2">
          Content *{' '}
          <span className="font-normal text-light-espresso/70">
            (Markdown supported: # for headings, ** for bold)
          </span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={18}
          className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso font-mono text-sm resize-y"
          placeholder="# Bar Name, City&#10;&#10;Write your full review here..."
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-ivory-mist rounded-xl">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-5 h-5 rounded border-ivory-mist-dark text-caramel focus:ring-caramel"
        />
        <label htmlFor="published" className="text-sm font-medium text-espresso">
          Publish this review (visible to everyone)
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-espresso text-ivory-mist font-semibold rounded-xl hover:bg-dark-espresso transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create Review' : 'Update Review'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="px-8 py-3 border border-light-espresso/40 text-light-espresso font-medium rounded-xl hover:bg-ivory-mist transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
