// src/components/StorySlider.tsx
'use client';

import { useState } from 'react';

type Slide = {
  id: string;
  text: string;
  image_url?: string;
  audio_url?: string;
};

type StorySliderProps = {
  slides: Slide[];
  title: string;
};

export default function StorySlider({ slides, title }: StorySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {currentSlide.image_url && (
        <img
          src={currentSlide.image_url}
          alt={`Slide ${currentIndex + 1}`}
          className="rounded-lg w-full object-cover h-64"
        />
      )}

      <p className="text-lg text-center">{currentSlide.text}</p>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goPrev}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>{currentIndex + 1} / {slides.length}</span>
        <button
          onClick={goNext}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
