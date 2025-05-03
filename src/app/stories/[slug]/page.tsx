'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function StoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [story, setStory] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchStoryData() {
      setLoading(true);

      // Fetch story data
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

      // Fetch slides data
      const { data: slideData, error: slideError } = await supabase
        .from('story_slides')
        .select('*')
        .eq('story_id', storyData.id)
        .order('order', { ascending: true });

      if (slideError) {
        console.error('Error fetching slides:', slideError.message);
        setSlides([]);
      } else {
        setSlides(slideData || []);
      }

      setLoading(false);
    }

    fetchStoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Story not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
      <p className="text-gray-700 mb-6">{story.description}</p>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={index} className="border p-4 rounded shadow">
            {slide.image_url && (
              <img
                src={slide.image_url}
                alt={`Slide ${index + 1}`}
                className="w-full h-auto mb-4"
              />
            )}
            {slide.audio_url && (
              <audio controls src={slide.audio_url} className="w-full mb-4"></audio>
            )}
            <p className="text-gray-800">{slide.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}