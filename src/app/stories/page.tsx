import { Suspense } from 'react';
import StoryInnerPage from './StoryInnerPage';

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <StoryInnerPage />
    </Suspense>
  );
}
