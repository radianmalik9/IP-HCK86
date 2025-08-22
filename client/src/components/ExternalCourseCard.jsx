import React from 'react';
import { StarIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function ExternalCourseCard({ course }) {
  const renderStars = (ratingInput) => {
    const rating = Number(ratingInput) || 0;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const formatStudentCount = (count) => {
    if (!count || isNaN(count)) return '—';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M students`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K students`;
    }
    return `${count} students`;
  };

  const getPlatformBadgeColor = (platform) => {
    switch (platform) {
      case 'Udemy':
        return 'bg-purple-100 text-purple-800';
      case 'YouTube':
        return 'bg-red-100 text-red-800';
      case 'Khan Academy':
        return 'bg-green-100 text-green-800';
      case 'Coursera':
        return 'bg-blue-100 text-blue-800';
      case 'edX':
        return 'bg-indigo-100 text-indigo-800';
      case 'MIT OCW':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Course Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=Course';
          }}
        />
        
        {/* Platform Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformBadgeColor(course.platform)}`}>
            {course.platform}
          </span>
        </div>

        {/* Free Badge */}
  {(course?.isFree || course?.price === 'Free' || course?.price === 0) && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              FREE
            </span>
          </div>
        )}

        {/* External Link Indicator */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black bg-opacity-75 rounded-full p-2">
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Course Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 mb-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-gray-600 mb-3">
          By {course.instructor}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {renderStars(course?.rating)}
            </div>
            <span className="text-xs text-gray-600 ml-1">
              {typeof course?.rating === 'number' ? course.rating.toFixed(1) : 'N/A'}
            </span>
          </div>

          {/* Student Count */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <UserGroupIcon className="w-3 h-3" />
            {formatStudentCount(course?.students ?? course?.reviews ?? course?.num_subscribers ?? 0)}
          </div>
        </div>

        {/* Course Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{course.level}</span>
          <span>{course.duration}</span>
        </div>

        {/* Action Button */}
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full btn-primary text-center text-sm py-2 flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <span>View Course</span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
