import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageLibrary } from './ImageLibrary';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  type: 'service' | 'category';
  label?: string;
}

export function ImageSelector({ value, onChange, type, label = 'Image' }: ImageSelectorProps) {
  const [mode, setMode] = useState<'url' | 'upload' | 'library' | null>(null);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Preview */}
      {value && (
        <div className="relative inline-block group">
          <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg ring-4 ring-pink-100">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2 hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-110 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* URL Input Mode */}
      {mode === 'url' && (
        <div className="space-y-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
          />
          <button
            type="button"
            onClick={() => setMode(null)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!mode && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode('url')}
            className="inline-flex items-center px-4 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            External URL
          </button>

          <button
            type="button"
            onClick={() => setMode('upload')}
            className="inline-flex items-center px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl text-sm font-medium text-pink-700 hover:bg-pink-50 hover:border-pink-300 transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New
          </button>

          <button
            type="button"
            onClick={() => setMode('library')}
            className="inline-flex items-center px-4 py-2.5 bg-white border-2 border-purple-200 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            From Library
          </button>
        </div>
      )}

      {/* Modals */}
      {mode === 'upload' && (
        <ImageUpload
          type={type}
          onImageUploaded={(url) => {
            onChange(url);
            setMode(null);
          }}
          onClose={() => setMode(null)}
        />
      )}

      {mode === 'library' && (
        <ImageLibrary
          type={type}
          onImageSelected={(url) => {
            onChange(url);
            setMode(null);
          }}
          onClose={() => setMode(null)}
        />
      )}
    </div>
  );
}
