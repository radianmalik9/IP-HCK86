import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function YouTubeVideoModal({ video, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {video.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative">
          <div className="aspect-video bg-gray-900">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <iframe
              src={`${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {video.channelTitle}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {video.viewCount && (
                <span>{formatViewCount(video.viewCount)} views</span>
              )}
              {video.publishedAt && (
                <span>{formatDate(video.publishedAt)}</span>
              )}
            </div>
          </div>
          
          {video.description && (
            <div className="text-sm text-gray-600 line-clamp-3">
              {video.description}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-4 py-2"
            >
              Watch on YouTube
            </a>
            <button
              onClick={onClose}
              className="btn-secondary text-sm px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function formatViewCount(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
