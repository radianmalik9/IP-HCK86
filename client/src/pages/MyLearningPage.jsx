import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../apis/services';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { showConfirm, showSuccess, handleApiError } from '../utils/notifications';

export default function MyLearningPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const res = await enrollmentAPI.getMyEnrollments();
      return res.data.data || [];
    },
  });

  const unenroll = useMutation({
    mutationFn: async (courseId) => enrollmentAPI.unenrollFromCourse(courseId),
    onSuccess: () => {
      showSuccess('Berhasil', 'Kursus dihapus dari pembelajaran kamu');
      refetch();
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  return (
    <div className="section-padding">
      <div className="container-wide">
        <PageHeader
          title="Pembelajaran Saya"
          subtitle="Lanjutkan kursus yang sedang kamu ikuti."
          actions={<button onClick={() => refetch()} className="btn-outline px-3 py-2 text-sm">Refresh</button>}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="large" />
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
            Gagal memuat data: {error?.message || 'Unknown error'}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-6">
            {data.length === 0 && (
              <EmptyState
                icon="📚"
                title="Belum ada kursus"
                message="Mulai dari topik yang kamu minati."
                actions={<a href="/courses" className="btn-primary px-4 py-2">Jelajahi Kursus</a>}
              />
            )}
            
            {data.length > 0 && (
              <>
                {/* Progress Summary */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{data.length}</p>
                      <p className="text-blue-100">Kursus Aktif</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {data.length > 0
                          ? Math.round(
                              data.reduce((acc, en) => acc + (parseFloat(en.progress) || 0), 0) /
                              data.length
                            )
                          : 0}%
                      </p>
                      <p className="text-blue-100">Progress Rata-rata</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {data.filter(en => (en.progress || 0) === 100).length}
                      </p>
                      <p className="text-blue-100">Kursus Selesai</p>
                    </div>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((en) => {
                    const course = en.Course || en.course || {};
                    const progress = parseFloat(en.progress) || 0;
                    const isCompleted = progress >= 100;
                    
                    return (
                      <div key={en.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        {/* Course Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Progress Badge */}
                          <div className="absolute top-3 right-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white/90 text-gray-800'
                            }`}>
                              {isCompleted ? '✓ Selesai' : `${Math.round(progress)}%`}
                            </div>
                          </div>
                        </div>

                        {/* Course Content */}
                        <div className="p-6">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                            {course.title || 'Untitled Course'}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-4">
                            Instruktur: {course.instructor?.fullName || 'Unknown'}
                          </p>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {course.duration || 0} menit
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {course.lessonsCount || 0} lessons
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <button 
                              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              onClick={() => navigate(`/learn/${en.courseId}`)}
                            >
                              {isCompleted ? 'Review Kursus' : 'Lanjutkan Belajar'}
                            </button>
                            <button
                              className={`py-3 px-4 rounded-lg font-medium transition-colors border ${
                                unenroll.isPending
                                  ? 'bg-gray-100 text-gray-400 border-gray-200'
                                  : 'text-danger-600 border-danger-200 hover:bg-danger-50'
                              }`}
                              disabled={unenroll.isPending}
                              onClick={async () => {
                                const result = await showConfirm(
                                  'Keluar dari kursus?',
                                  'Kamu bisa mendaftar lagi kapan saja.',
                                  'Ya, keluar',
                                  'Batal'
                                );
                                if (result.isConfirmed) {
                                  unenroll.mutate(en.courseId);
                                }
                              }}
                            >
                              {unenroll.isPending ? 'Menghapus…' : 'Hapus dari Pembelajaran'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
