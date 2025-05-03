'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    coverFile: null as File | null,
    coverAudio: null as File | null,
    slides: [] as { image: File | null; audio: File | null; description: string }[],
  });
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [session, setSession] = useState<any | null>(null);
  const router = useRouter();

  const YOUR_DOMAIN = 'https://imagineyou.xyz';
  const SUPABASE_MEDIA_URL = 'https://rtixmkzobgswzuqewcvk.supabase.co/storage/v1/object/public/media';

  const coverAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for cover audio

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error('No active session:', error?.message || 'Session missing');
        alert('You must be logged in to access this page.');
        router.push('/login'); // Redirect to login page
        return;
      }
      setSession(data.session);
    };

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        router.push('/login'); // Redirect to login page on sign-out
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => {
      subscription.subscription.unsubscribe(); // Correctly access the unsubscribe function
    };
  }, [router]);

  useEffect(() => {
    // Fetch stories on component mount
    loadStories();
  }, []);

  async function loadStories() {
    const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching stories:', error.message);
    } else {
      console.log('Fetched stories:', data);
      setStories(data || []);
    }
  }

  function handleSlideChange(index: number, field: 'image' | 'audio' | 'description', value: File | string | null) {
    const updatedSlides = [...form.slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value || '' }; // Ensure non-null value
    setForm(prev => ({ ...prev, slides: updatedSlides }));
  }

  function handleAddSlide() {
    setForm(prev => ({ ...prev, slides: [...prev.slides, { image: null, audio: null, description: '' }] }));
  }

  function handleFileChange(e: any, field: 'coverFile' | 'coverAudio') {
    setForm(prev => ({ ...prev, [field]: e.target.files[0] }));
  }

  function resetForm() {
    setForm({ title: '', description: '', coverFile: null, coverAudio: null, slides: [] });
    setEditingStory(null);
    setUploadProgress(0);
  }

  async function handleDeleteStory(id: string) {
    if (confirm('Are you sure you want to delete this story and its slides?')) {
      await supabase.from('story_slides').delete().eq('story_id', id);
      await supabase.from('stories').delete().eq('id', id);
      await loadStories(); // Ensure loadStories is awaited
      alert('Story deleted successfully.');
    }
  }

  async function handleEditStory(story: any) {
    setEditingStory(story);
    setForm({ title: story.title, description: story.description, coverFile: null, coverAudio: null, slides: [] });
  }

  async function handleSubmit() {
    if (!form.title) {
      alert('Title is required.');
      return;
    }

    const slug = form.title.toLowerCase().replace(/\s+/g, '-');

    let coverUrl = editingStory?.cover_image_url || '';
    let coverAudioUrl = editingStory?.cover_audio_url || '';

    // Upload cover image if provided
    if (form.coverFile) {
      const { data, error } = await supabase.storage.from('media/covers').upload(`${uuidv4()}`, form.coverFile);
      if (error) {
        console.error('Cover Upload Error:', error.message);
        alert('Error uploading cover image.');
        return;
      }

      // Construct the public URL for the uploaded file
      if (data?.path) {
        coverUrl = `${SUPABASE_MEDIA_URL}/covers/${data.path}`;
      } else {
        console.error('Cover Upload Error: No path returned from Supabase.');
        alert('Error uploading cover image.');
        return;
      }
    }

    // Upload cover audio if provided
    if (form.coverAudio) {
      const { data, error } = await supabase.storage.from('media/audio').upload(`${uuidv4()}`, form.coverAudio);
      if (error) {
        console.error('Cover Audio Upload Error:', error.message);
        alert('Error uploading cover audio.');
        return;
      }

      // Construct the public URL for the uploaded audio
      if (data?.path) {
        coverAudioUrl = `${SUPABASE_MEDIA_URL}/audio/${data.path}`;
      } else {
        console.error('Cover Audio Upload Error: No path returned from Supabase.');
        alert('Error uploading cover audio.');
        return;
      }
    }

    let storyId = editingStory?.id;

    // Update or insert story
    if (editingStory) {
      const { error: updateError } = await supabase
        .from('stories')
        .update({ title: form.title, description: form.description, slug, cover_image_url: coverUrl, cover_audio_url: coverAudioUrl })
        .eq('id', editingStory.id);
      if (updateError) {
        console.error('Story Update Error:', updateError.message);
        alert('Error updating story.');
        return;
      }
    } else {
      const { data: newStory, error: insertError } = await supabase
        .from('stories')
        .insert([{ title: form.title, description: form.description, slug, cover_image_url: coverUrl, cover_audio_url: coverAudioUrl }])
        .select()
        .single();
      if (insertError) {
        console.error('Story Insert Error:', insertError.message);
        alert('Error inserting story.');
        return;
      }
      storyId = newStory.id;
    }

    console.log('Authenticated user ID:', session?.user?.id);
    console.log('Story ID for slides:', storyId);
    console.log('Slides to upload:', form.slides);

    // Upload slides
    for (let i = 0; i < form.slides.length; i++) {
      const slide = form.slides[i];
      let imageUrl = null;
      let audioUrl = null;

      // Upload slide image
      if (slide.image) {
        const { data, error } = await supabase.storage.from('media/images').upload(`${uuidv4()}`, slide.image);
        if (error) {
          console.error('Slide Image Upload Error:', error.message);
          continue;
        }

        // Construct the public URL for the uploaded image
        if (data?.path) {
          imageUrl = `${SUPABASE_MEDIA_URL}/images/${data.path}`;
        } else {
          console.error('Slide Image Upload Error: No path returned from Supabase.');
          continue;
        }
      }

      // Upload slide audio
      if (slide.audio) {
        const { data, error } = await supabase.storage.from('media/audio').upload(`${uuidv4()}`, slide.audio);
        if (error) {
          console.error('Slide Audio Upload Error:', error.message);
        } else if (data?.path) {
          audioUrl = `${SUPABASE_MEDIA_URL}/audio/${data.path}`;
        }
      }

      // Insert slide into database
      const { error: insertSlideError } = await supabase.from('story_slides').insert({
        story_id: storyId,
        text: slide.description || 'Slide',
        image_url: imageUrl,
        audio_url: audioUrl,
        order: i + 1,
      });

      if (insertSlideError) {
        console.error('Slide Insert Error:', insertSlideError.message);
      }

      setUploadProgress(Math.round(((i + 1) / form.slides.length) * 100));
    }

    alert('Story saved successfully!');
    resetForm();
    await loadStories(); // Ensure loadStories is awaited
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="flex justify-end mb-6">
        <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          📊 Go to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Admin - Story Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Existing Stories */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Existing Stories</h2>
          {stories.length > 0 ? (
            stories.map((story) => (
              <div key={story.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
                <div className="mb-2">
                  <p className="font-bold text-lg">{story.title}</p>
                  <p className="text-gray-500 text-sm">{story.slug}</p>
                </div>
                <div className="mb-2">
                  {story.cover_image_url && (
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="w-full h-auto cursor-pointer"
                      onClick={() => {
                        if (coverAudioRef.current) {
                          coverAudioRef.current.pause();
                          coverAudioRef.current.currentTime = 0;
                          coverAudioRef.current.play();
                        }
                      }}
                    />
                  )}
                  {story.cover_audio_url && (
                    <audio ref={coverAudioRef} src={story.cover_audio_url} />
                  )}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button onClick={() => handleEditStory(story)} className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
                  <button onClick={() => handleDeleteStory(story.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No stories found.</p>
          )}
        </div>

        {/* Create/Edit Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">{editingStory ? 'Edit Story' : 'Create New Story'}</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4">
            <input type="text" placeholder="Title" value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded" />

            <textarea placeholder="Description" value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded" />

            <label className="block font-semibold">Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverFile')} />

            <label className="block font-semibold">Cover Audio (optional)</label>
            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'coverAudio')} />

            <h3 className="text-lg font-bold mt-6">Slides</h3>
            {form.slides.map((slide, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <label>Slide Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handleSlideChange(index, 'image', e.target.files?.[0] || null)} />
                <label>Slide Audio (optional):</label>
                <input type="file" accept="audio/*" onChange={(e) => handleSlideChange(index, 'audio', e.target.files?.[0] || null)} />
                <label>Slide Description:</label>
                <textarea
                  placeholder="Enter slide description"
                  value={slide.description}
                  onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}

            <button onClick={handleAddSlide} className="w-full bg-blue-500 text-white py-2 rounded">➕ Add Another Slide</button>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            <button onClick={handleSubmit} className="w-full bg-green-500 text-white py-2 rounded">
              {editingStory ? 'Update Story' : 'Create Story'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}