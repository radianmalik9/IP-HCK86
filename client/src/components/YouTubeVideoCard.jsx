import React from 'react';
import { PlayIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function YouTubeVideoCard({ video, onClick }) {
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatPublishedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
      onClick={() => onClick(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
          <PlayIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Duration badge (if available) */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-5 mb-2">
          {video.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {video.channelTitle}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {video.viewCount && (
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3" />
              {formatViewCount(video.viewCount)}
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatPublishedDate(video.publishedAt)}
          </div>
        </div>
      </div>
    </div>
  );

  function formatDuration(durationString) {
    // Parse ISO 8601 duration format or seconds
    if (typeof durationString === 'number') {
      const hours = Math.floor(durationString / 3600);
      const minutes = Math.floor((durationString % 3600) / 60);
      const seconds = durationString % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Parse ISO 8601 format (PT4M13S)
    const match = durationString.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
