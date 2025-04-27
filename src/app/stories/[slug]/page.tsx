import { supabase } from '@/lib/supabaseClient';
import StorySlider from '@/components/StorySlider';

interface PageProps {
  params: { slug: string };
}

// Corrected line: Destructure slug directly from params in the function signature
export default async function StoryPage({ params: { slug } }: PageProps) {
  // Removed: const { slug } = params; - This line caused the error

  // Fetch the story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug) // Now using the directly destructured slug
    .single();

  if (storyError || !story) {
    // It might be helpful to log the error for debugging
    console.error('Error fetching story:', storyError);
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        Error loading story. Please check the console for details.
      </div>
    );
  }

  // Fetch the slides
  const { data: slides, error: slidesError } = await supabase
    .from('story_slides')
    .select('*')
    .eq('story_id', story.id)
    .order('order', { ascending: true });

  // It might be helpful to log the slides error too
  if (slidesError) {
     console.error('Error fetching slides:', slidesError);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">{story.title}</h1>

      {/* Improved error handling display */}
      {slidesError ? (
         <p className="text-center text-red-400">Error loading slides.</p>
      ) : !slides?.length ? (
        <p className="text-center text-yellow-400">No slides found for this story.</p>
      ) : (
        <StorySlider slides={slides} title={story.title} />
      )}
    </main>
  );
}