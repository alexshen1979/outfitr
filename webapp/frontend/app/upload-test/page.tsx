'use client';

import ImageUpload from '@/components/ImageUpload';
import { useState } from 'react';

export default function UploadTestPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const handleUploadSuccess = (url: string, filename: string) => {
    setUploadedUrl(url);
    setUploadedFilename(filename);
    console.log('Upload successful:', { url, filename });
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Image Upload Test</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Type
            </label>
            <select className="rounded-md border border-gray-300 px-3 py-2">
              <option value="wardrobe">Wardrobe</option>
              <option value="avatar">Avatar</option>
              <option value="user-photo">User Photo</option>
              <option value="outfit-result">Outfit Result</option>
            </select>
          </div>

          <ImageUpload
            uploadType="wardrobe"
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            className="mb-6"
          />

          {uploadedUrl && (
            <div className="mt-6 rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Upload Successful!</p>
              <p className="mt-1 text-sm text-green-700">Filename: {uploadedFilename}</p>
              <p className="mt-1 text-sm text-green-700">URL: {uploadedUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

