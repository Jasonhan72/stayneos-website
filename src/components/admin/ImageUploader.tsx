'use client';

import { useState, useCallback } from 'react';

interface ImageUploaderProps {
  propertyId?: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ propertyId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (propertyId) formData.append('propertyId', propertyId);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '上传失败');
    }

    const data = await res.json();
    return data.url as string;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError('');
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const urls: string[] = [];

      for (const file of fileArray) {
        const url = await uploadFile(file);
        urls.push(url);
      }

      onChange([...images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  }, [images, onChange, propertyId, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleReorder = (from: number, to: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">房源图片</label>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = 'image/jpeg,image/png,image/webp,image/avif';
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFiles(files);
          };
          input.click();
        }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">上传中...</span>
          </div>
        ) : (
          <>
            <p className="text-2xl mb-2">📸</p>
            <p className="text-sm text-gray-600">拖拽图片到这里，或点击选择文件</p>
            <p className="text-xs text-gray-400 mt-1">支持 JPEG、PNG、WebP、AVIF，最大 10MB</p>
          </>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="或输入图片 URL..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
        >
          添加
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`图片 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-property.jpg'; }}
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  封面
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                    title="上移"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                    title="下移"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">第一张图片将作为封面。拖拽或点击箭头调整顺序。</p>
    </div>
  );
}
