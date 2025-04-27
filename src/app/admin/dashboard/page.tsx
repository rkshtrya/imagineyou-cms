'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const [storyCount, setStoryCount] = useState<number>(0);
  const [slideCount, setSlideCount] = useState<number>(0);
  const [audioSlideCount, setAudioSlideCount] = useState<number>(0);
  const [topStories, setTopStories] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    const { count: storyTotal } = await supabase.from('stories').select('*', { count: 'exact', head: true });
    const { count: slideTotal } = await supabase.from('story_slides').select('*', { count: 'exact', head: true });
    const { count: audioSlides } = await supabase
      .from('story_slides')
      .select('audio_url', { count: 'exact', head: true })
      .not('audio_url', 'is', null);

    if (storyTotal !== null) setStoryCount(storyTotal);
    if (slideTotal !== null) setSlideCount(slideTotal);
    if (audioSlides !== null) setAudioSlideCount(audioSlides);

    // Now fetch top 5 most viewed stories
    const { data: top } = await supabase
      .from('stories')
      .select('id, title, views') // assuming you have a 'views' column!
      .order('views', { ascending: false })
      .limit(5);

    if (top) setTopStories(top);
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-center">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Total Stories</p>
          <p className="text-5xl font-bold text-blue-600">{storyCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Total Slides</p>
          <p className="text-5xl font-bold text-green-500">{slideCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Slides with Audio</p>
          <p className="text-5xl font-bold text-purple-500">{audioSlideCount}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">🔥 Top 5 Most Viewed Stories</h2>
        <div className="space-y-4">
          {topStories.map((story, index) => (
            <div key={story.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
              <span className="text-lg font-semibold">{index + 1}. {story.title}</span>
              <span className="text-sm text-gray-500">{story.views} views</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
          ➡️ Go to Story Manager
        </Link>
      </div>
    </main>
  );
}
