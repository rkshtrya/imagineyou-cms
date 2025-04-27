'use client';

import { useState, useRef, useEffect } from "react";

interface FilterMenuProps {
  onFilterChange: (type: 'category' | 'theme', value: string) => void;
}

export default function FilterMenu({ onFilterChange }: FilterMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Mahabharata', 'Ramayana', 'Folktale'];
  const themes = ['All', 'Leadership', 'Wisdom', 'Devotion'];

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        dropdownRef.current.style.display = "none";
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <div ref={dropdownRef} className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg w-64 border dark:border-gray-600 space-y-6">
      <div>
        <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button key={category} onClick={() => onFilterChange("category", category)} className="bg-blue-200 dark:bg-blue-800 text-sm px-3 py-1 rounded hover:bg-blue-300 dark:hover:bg-blue-700">{category}</button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">Themes</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button key={theme} onClick={() => onFilterChange("theme", theme)} className="bg-green-200 dark:bg-green-800 text-sm px-3 py-1 rounded hover:bg-green-300 dark:hover:bg-green-700">{theme}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
