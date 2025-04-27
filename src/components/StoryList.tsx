'use client';

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface Story {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
}

export default function StoryList() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    async function fetchStories() {
      const { data } = await supabase
        .from('stories')
        .select('id, title, slug, cover_image_url');
      if (data) {
        setStories(data);
      }
    }

    fetchStories();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.slug}`}
          className="border p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center"
        >
          {story.cover_image_url && (
            <img
              src={story.cover_image_url}
              alt={story.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-lg font-bold">{story.title}</h2>
        </Link>
      ))}
    </div>
  );
}
