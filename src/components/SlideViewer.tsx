'use client';

import { useState } from "react";

interface Slide {
  id: string;
  image_url: string;
  text: string;
}

export default function SlideViewer({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="flex flex-col items-center gap-6">
      {currentSlide ? (
        <>
          {currentSlide.image_url && (
            <img
              src={currentSlide.image_url}
              alt="Slide Image"
              className="w-full max-w-md h-64 object-cover rounded-lg"
            />
          )}
          <p className="text-lg text-center">{currentSlide.text}</p>
        </>
      ) : (
        <div className="text-2xl font-bold text-center">The End 🎉</div>
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}
