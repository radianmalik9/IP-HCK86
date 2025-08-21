import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDuration, formatPrice } from '../utils/formatters';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="card overflow-hidden group">
      <div className="aspect-video bg-secondary-100 overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-400">No Image</div>
        )}
      </div>
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-primary">{course.level || 'Beginner'}</span>
          <span className="text-secondary-600 text-sm">{formatDuration(course.duration || 0)}</span>
        </div>
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-secondary-600 line-clamp-2 mb-3">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-primary-700 font-semibold">{formatPrice(Number(course.price) || 0, 'USD')}</div>
          <div className="text-sm text-secondary-500">{course.studentsCount || 0} students</div>
        </div>
      </div>
    </Link>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.number,
    level: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    thumbnail: PropTypes.string,
    studentsCount: PropTypes.number,
  })
}
