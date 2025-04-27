// /src/app/admin/page.tsx (final full working version)

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    coverFile: null as File | null,
    slides: [] as { image: File | null; audio: File | null }[],
  });
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (!error) setStories(data || []);
  }

  function handleSlideChange(index: number, field: 'image' | 'audio', value: File | null) {
    const updatedSlides = [...form.slides];
    updatedSlides[index][field] = value;
    setForm(prev => ({ ...prev, slides: updatedSlides }));
  }

  function handleAddSlide() {
    setForm(prev => ({ ...prev, slides: [...prev.slides, { image: null, audio: null }] }));
  }

  function handleFileChange(e: any, type: 'cover') {
    if (type === 'cover') setForm(prev => ({ ...prev, coverFile: e.target.files[0] }));
  }

  function resetForm() {
    setForm({ title: '', description: '', coverFile: null, slides: [] });
    setEditingStory(null);
    setUploadProgress(0);
  }

  async function handleDeleteStory(id: string) {
    if (confirm('Are you sure you want to delete this story and its slides?')) {
      await supabase.from('story_slides').delete().eq('story_id', id);
      await supabase.from('stories').delete().eq('id', id);
      loadStories();
      alert('Story deleted successfully.');
    }
  }

  async function handleEditStory(story: any) {
    setEditingStory(story);
    setForm({
      title: story.title,
      description: story.description,
      coverFile: null,
      slides: [], // fresh, you can load slides if needed later
    });
  }

  async function handleSubmit() {
    if (!form.title) {
      alert('Title is required.');
      return;
    }

    const slug = form.title.toLowerCase().replace(/\s+/g, '-');

    let coverUrl = editingStory?.cover_image_url || '';

    if (form.coverFile) {
      const { data, error } = await supabase.storage.from('media/covers').upload(`${uuidv4()}`, form.coverFile);
      if (error) {
        console.error('Cover Upload Error:', error.message);
        alert('Error uploading cover image.');
        return;
      }
      coverUrl = data?.path ? `https://YOUR-SUPABASE-URL/storage/v1/object/public/media/covers/${data.path}` : '';
    }

    let storyId = editingStory?.id;

    if (editingStory) {
      const { error: updateError } = await supabase.from('stories')
        .update({ title: form.title, description: form.description, slug, cover_image_url: coverUrl })
        .eq('id', editingStory.id);
      if (updateError) {
        console.error('Story Update Error:', updateError.message);
        alert('Error updating story.');
        return;
      }
    } else {
      const { data: newStory, error: insertError } = await supabase.from('stories')
        .insert([{ title: form.title, description: form.description, slug, cover_image_url: coverUrl }])
        .select()
        .single();
      if (insertError) {
        console.error('Story Insert Error:', insertError.message);
        alert('Error inserting story.');
        return;
      }
      storyId = newStory.id;
    }

    for (let i = 0; i < form.slides.length; i++) {
      const slide = form.slides[i];
      let imageUrl = null;
      let audioUrl = null;

      if (slide.image) {
        const { data, error } = await supabase.storage.from('media/images').upload(`${uuidv4()}`, slide.image);
        if (error) {
          console.error('Slide Image Upload Error:', error.message);
          continue;
        }
        imageUrl = `https://YOUR-SUPABASE-URL/storage/v1/object/public/media/images/${data.path}`;
      }

      if (slide.audio) {
        const { data, error } = await supabase.storage.from('media/audio').upload(`${uuidv4()}`, slide.audio);
        if (error) {
          console.error('Slide Audio Upload Error:', error.message);
        } else {
          audioUrl = `https://YOUR-SUPABASE-URL/storage/v1/object/public/media/audio/${data.path}`;
        }
      }

      await supabase.from('story_slides').insert({
        story_id: storyId,
        text: slide.image?.name.replace(/\.[^/.]+$/, '') || 'Slide',
        image_url: imageUrl,
        audio_url: audioUrl,
        order: i + 1,
      });

      setUploadProgress(Math.round(((i + 1) / form.slides.length) * 100));
    }

    alert('Story saved successfully!');
    resetForm();
    loadStories();
  }

  return (
      <main className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
        <div className="flex justify-end mb-6">
          <Link href="/admin/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            📊 Go to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">Admin - Story Manager</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* List existing stories */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Existing Stories</h2>
            {stories.map((story) => (
                <div key={story.id}
                     className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{story.title}</p>
                    <p className="text-gray-500 text-sm">{story.slug}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditStory(story)}
                            className="px-3 py-1 bg-blue-500 text-white rounded">Edit
                    </button>
                    <button onClick={() => handleDeleteStory(story.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded">Delete
                    </button>
                  </div>
                </div>
            ))}
          </div>

          {/* Create/Edit Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">{editingStory ? 'Edit Story' : 'Create New Story'}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <input type="text" placeholder="Title" value={form.title}
                     onChange={e => setForm(prev => ({...prev, title: e.target.value}))}
                     className="w-full p-2 mb-4 border rounded"/>
              <textarea placeholder="Description" value={form.description}
                        onChange={e => setForm(prev => ({...prev, description: e.target.value}))}
                        className="w-full p-2 mb-4 border rounded"></textarea>
              <label className="block mb-2 font-semibold">Cover Image</label>
              <input type="file" onChange={(e) => handleFileChange(e, 'cover')} className="mb-4"/>

              <h3 className="text-lg font-bold mt-6 mb-2">Slides</h3>
              {form.slides.map((slide, index) => (
                  <div key={index} className="border p-4 rounded mb-4">
                    <label className="block mb-1 font-semibold">Slide Image:</label>
                    <input type="file" accept="image/*"
                           onChange={(e) => handleSlideChange(index, 'image', e.target.files?.[0] || null)}/>
                    <label className="block mt-2 mb-1 font-semibold">Slide Audio (optional):</label>
                    <input type="file" accept="audio/*"
                           onChange={(e) => handleSlideChange(index, 'audio', e.target.files?.[0] || null)}/>
                  </div>
              ))}

              <button onClick={handleAddSlide} className="w-full bg-blue-500 text-white py-2 rounded mb-4">➕ Add Another
                Slide
              </button>

              {uploadProgress > 0 && <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{width: `${uploadProgress}%`}}></div>
              </div>}

              <button onClick={handleSubmit} className="w-full bg-green-500 text-white py-2 rounded">
                {editingStory ? 'Update Story' : 'Create Story'}
              </button>
            </div>
          </div>
        </div>
      </main>
  );
}
