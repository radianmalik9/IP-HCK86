import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseAPI, enrollmentAPI } from '../apis/services';
import LoadingSpinner from '../components/LoadingSpinner';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const currentLessonId = lessonId;
  useDocumentTitle('Belajar · Smart Learning');

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const res = await courseAPI.getCourse(courseId);
      const course = res.data.data;
      const lessons = (course?.Lessons || []).sort((a,b)=>a.order-b.order);
      // fetch completed lessons for this course
      try {
        const completedRes = await enrollmentAPI.getCompletedLessons(courseId);
        const completedIds = completedRes.data.data || [];
        const lessonsWithState = lessons.map(ls => ({ ...ls, completed: completedIds.includes(ls.id) }));
        return { course, lessons: lessonsWithState };
      } catch (_) {
        return { course, lessons };
      }
    }
  });

  const markComplete = useMutation({
    mutationFn: async (lsId) => {
      await enrollmentAPI.markLessonComplete(courseId, lsId);
    },
    onSuccess: async (_, lsId) => {
      // refresh this page's lessons state
      await queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      // also refresh My Learning progress so the card updates when navigating back
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner size="large" /></div>
    );
  }

  if (isError) {
    return (
      <div className="container-wide section-padding">
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
          Gagal memuat pelajaran: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  const { lessons } = data;
  const activeLesson = currentLessonId
    ? lessons.find((l) => String(l.id) === String(currentLessonId))
    : lessons[0];

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container-wide grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 h-screen">
        {/* Main Video/Content Area */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Video Player */}
          <div className="relative bg-black rounded-none lg:rounded-xl overflow-hidden flex-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M13 16h-1.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H7m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2h6a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Player</h3>
                <p className="text-gray-400">Konten video akan dimuat di sini</p>
              </div>
            </div>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4 text-white">
                <button className="hover:text-blue-400 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6v4H9z" />
                  </svg>
                </button>
                <div className="flex-1 bg-white/20 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full w-1/3"></div>
                </div>
                <span className="text-sm">12:45 / 38:20</span>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-white lg:bg-gray-800 lg:text-white p-6 lg:rounded-xl lg:mt-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{activeLesson?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 lg:text-gray-300">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {activeLesson?.duration} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Lesson {lessons.findIndex(l => l.id === activeLesson?.id) + 1} dari {lessons.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={markComplete.isPending}
                onClick={() => markComplete.mutate(activeLesson.id)}
              >
                {markComplete.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tandai Selesai
                  </span>
                )}
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Download Materi
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Curriculum */}
        <aside className="lg:col-span-1 bg-white lg:bg-gray-800 lg:rounded-xl lg:my-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200 lg:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-900 lg:text-white">Kurikulum Kursus</h2>
            <p className="text-sm text-gray-600 lg:text-gray-300 mt-1">
              {lessons.filter(l => l.completed).length} dari {lessons.length} lesson selesai
            </p>
          </div>
          
          <div className="h-full overflow-y-auto">
            <ul className="space-y-1 p-2">
              {lessons.map((ls, index) => {
                const isActive = String(activeLesson?.id) === String(ls.id);
                const isCompleted = !!ls.completed;
                
                return (
                  <li key={ls.id}>
                    <Link
                      to={`/learn/${courseId}/lesson/${ls.id}`}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-100 lg:bg-blue-600 text-blue-900 lg:text-white'
                          : 'hover:bg-gray-100 lg:hover:bg-gray-700 text-gray-700 lg:text-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isActive ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 lg:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 lg:text-gray-400 text-xs font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">{ls.title}</p>
                        <p className="text-xs text-gray-500 lg:text-gray-400 mt-1">
                          {ls.duration} menit
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
