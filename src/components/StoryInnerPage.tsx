'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StorySlider from '@/components/StorySlider';
import { useParams } from 'next/navigation';

export default function StoryInnerPage() {
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
        const processedSlides = (slideData || []).map(slide => ({
          ...slide,
          image_url: slide.image_url || '/default-image.jpg',
        }));
        setSlides(processedSlides);
      }

      setLoading(false);
    }

    fetchStoryData();
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Invalid story URL.</p>
      </div>
    );
  }

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
      {story.cover_image_url && (
        <img
          src={story.cover_image_url}
          alt={story.title}
          className="w-full h-auto rounded-lg mb-6"
        />
      )}
      <h1 className="text-xl font-bold mb-4">{story.title}</h1>
      <p className="text-gray-700 mb-6">{story.description}</p>
      {slides.length > 0 ? (
        <StorySlider slides={slides} title={story.title} />
      ) : (
        <p className="text-gray-500">No slides available for this story.</p>
      )}
    </div>
  );
}