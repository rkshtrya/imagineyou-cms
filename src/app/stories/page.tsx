'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import StorySlider from '@/components/StorySlider';

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const [story, setStory] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchStoryData() {
      setLoading(true);

      // Fetch the story by slug
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (storyError) {
        console.error('Error fetching story:', storyError.message);
        setLoading(false);
        return;
      }

      setStory(storyData);

      // Fetch slides belonging to this story
      const { data: slideData, error: slideError } = await supabase
        .from('story_slides')
        .select('*')
        .eq('story_id', storyData.id)
        .order('order', { ascending: true });

      if (slideError) {
        console.error('Error fetching slides:', slideError.message);
      } else {
        setSlides(slideData || []);
      }

      setLoading(false);
    }

    fetchStoryData();
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">No story selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Story not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">{story.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">{story.description}</p>

        {slides.length > 0 ? (
          <StorySlider slides={slides} />
        ) : (
          <p className="text-gray-500 text-center">No slides available for this story yet.</p>
        )}
      </div>
    </main>
  );
}
