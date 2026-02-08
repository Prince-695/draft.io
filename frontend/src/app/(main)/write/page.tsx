'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { ROUTES } from '@/utils/constants';

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const handleSave = async () => {
    try {
      // TODO: Call API to save blog
      console.log({ title, content, tags, coverImage, status });
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const handlePublish = async () => {
    setStatus('published');
    await handleSave();
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {coverImage && (
            <div className="mt-4 relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Title..."
          className="w-full text-4xl font-bold border-none focus:outline-none mb-4 placeholder:text-gray-300"
        />

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tags (press Enter)..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={addTag}
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Editor */}
        <Editor
          content={content}
          onChange={setContent}
          placeholder="Start writing your amazing blog..."
        />
      </div>
    </div>
  );
}
