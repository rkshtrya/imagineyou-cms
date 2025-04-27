'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import FilterMenu from '@/components/FilterMenu';
import Link from 'next/link';

export default function Page() {
  const [category, setCategory] = useState<string>('All');
  const [theme, setTheme] = useState<string>('All');
  const [stories, setStories] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilterChange = async (type: 'category' | 'theme', value: string) => {
    if (type === 'category') setCategory(value);
    if (type === 'theme') setTheme(value);

    let query = supabase.from('stories').select('*');

    if (value !== 'All') {
      query = type === 'category'
        ? query.eq('category', value)
        : query.eq('theme', value);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) setStories(data || []);
    else console.error('Error:', error.message);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setStories(data || []);
      else console.error('Error loading initial stories:', error.message);
    })();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
      {/* Header: Hamburger + Title */}
      <div className="flex items-center justify-start mb-6 space-x-4">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="text-2xl font-bold text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded"
        >
          ☰
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Kids Story App 📚
        </h1>
      </div>

      {/* Show FilterMenu on hamburger click */}
      {filterOpen && (
        <div className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mt-2">
          <FilterMenu onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stories.length > 0 ? (
          stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.slug}`}>
              <div className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition flex flex-col">
                {story.cover_image_url && (
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
                  {story.title}
                </h2>
                {story.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    {story.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">No stories available.</p>
        )}
      </div>
    </main>
  );
}
