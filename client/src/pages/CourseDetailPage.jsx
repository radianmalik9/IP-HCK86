import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { courseAPI, enrollmentAPI } from '../apis/services';
import LoadingSpinner from '../components/LoadingSpinner';
import { enrollmentSuccess, enrollmentError, showInfo, handleApiError, showConfirm } from '../utils/notifications';
import youtubeService from '../apis/youtube';
import YouTubeVideoCard from '../components/YouTubeVideoCard';
import YouTubeVideoModal from '../components/YouTubeVideoModal';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await courseAPI.getCourse(id);
      return res.data.data;
    }
  });

  // Enrollments & favorites for this course
  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['my-enrollments', isAuthenticated],
    enabled: !!isAuthenticated,
    queryFn: async () => (await enrollmentAPI.getMyEnrollments()).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });
  const { data: favorites = [] } = useQuery({
    queryKey: ['my-favorites', isAuthenticated],
    enabled: !!isAuthenticated,
    queryFn: async () => (await enrollmentAPI.getFavorites()).data?.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const { data: relatedNews = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['course-related-news', id],
    enabled: !!NEWS_API_KEY && !!id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Fetch course to get title for query
      const res = await courseAPI.getCourse(id);
      const course = res.data.data;
      const keywords = [course?.title, ...(course?.tags || [])].filter(Boolean).join(' OR ');
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.set('q', keywords || course?.title || 'learning');
      url.searchParams.set('language', 'id');
      url.searchParams.set('pageSize', '4');
      const r = await fetch(url.toString(), { headers: { 'X-Api-Key': NEWS_API_KEY } });
      const json = await r.json();
      if (json.status !== 'ok') throw new Error(json.message || 'NewsAPI error');
      return json.articles || [];
    },
  });

  // YouTube related videos
  const { data: youtubeVideos = [], isLoading: youtubeLoading } = useQuery({
    queryKey: ['youtube-videos', data?.title, data?.tags],
    enabled: !!data?.title && !!import.meta.env.VITE_YOUTUBE_API_KEY,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await youtubeService.getCourseRelatedVideos(data.title, data.tags || []);
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      // Prefer POST /enrollments with body { courseId }
      await enrollmentAPI.enrollInCourse(id);
    },
    onSuccess: () => {
      enrollmentSuccess(data?.title || 'this course');
      navigate(`/learn/${id}`);
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        showInfo('Login Required', 'Please login to enroll in this course.');
        navigate(`/login?next=/courses/${id}`);
      } else {
        handleApiError(err);
      }
    },
  });

  const isEnrolled = useMemo(() =>
    myEnrollments?.some((e) => String(e.courseId || e.Course?.id) === String(id))
  , [myEnrollments, id]);

  const isFavorite = useMemo(() =>
    favorites?.some((f) => String(f.courseId || f.Course?.id) === String(id))
  , [favorites, id]);

  const favAdd = useMutation({
    mutationFn: async () => enrollmentAPI.addToFavorites(id),
  });
  const favRemove = useMutation({
    mutationFn: async () => enrollmentAPI.removeFromFavorites(id),
  });

  useEffect(() => {
    if (data?.title) {
      document.title = `${data.title} · Smart Learning`;
    }
  }, [data?.title]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner size="large" /></div>
    );
  }
  if (isError) {
    return (
      <div className="container-wide section-padding">
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
          Gagal memuat detail: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  const course = data;
  const lessons = (course.Lessons || []).slice().sort((a,b)=>a.order-b.order);
  const visibleLessons = showAllLessons ? lessons : lessons.slice(0, 12);
  const canToggleLessons = lessons.length > 12;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container-wide py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-blue-100 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-white transition-colors">Kursus</Link>
            <span>/</span>
            <span className="text-white line-clamp-1" title={course.title}>{course.title}</span>
          </nav>

          {/* Course Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                  {course.level}
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {course.duration} menit
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {Number(course.price) === 0 ? 'Gratis' : `Rp ${course.price}.000`}
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              
              <div className="flex items-center gap-6 text-blue-100 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Instruktur: {course.instructor?.fullName || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{lessons.length} Materi</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>256 Siswa</span>
                </div>
              </div>

              <p className="text-blue-100 leading-relaxed">
                {descExpanded ? course.description : (course.description || '').slice(0, 240)}
                {course.description && course.description.length > 240 && (
                  <>
                    {!descExpanded && '… '}
                    <button className="text-white hover:underline font-medium ml-1" onClick={() => setDescExpanded((v) => !v)}>
                      {descExpanded ? 'Tampilkan lebih sedikit' : 'Selengkapnya'}
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {Number(course.price) === 0 ? 'Gratis' : `Rp ${course.price}.000`}
                    </div>
                    {Number(course.price) > 0 && (
                      <div className="text-sm text-gray-500 line-through">Rp {course.price * 2}.000</div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <button
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                        isEnrolled 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                      disabled={enrollMutation.isPending}
                      onClick={async () => {
                        if (isEnrolled) {
                          navigate(`/learn/${id}`);
                          return;
                        }
                        if (!isAuthenticated) {
                          const res = await showConfirm('Butuh Login', 'Login dulu untuk daftar kursus ini.', 'Login', 'Batal');
                          if (res.isConfirmed) navigate('/login', { state: { from: `/courses/${id}` } });
                          return;
                        }
                        enrollMutation.mutate();
                      }}
                    >
                      {enrollMutation.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="small" />
                          Memproses…
                        </div>
                      ) : isEnrolled ? (
                        'Lanjutkan Belajar'
                      ) : (
                        'Daftar Sekarang'
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 transition-colors"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                        }}
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                      
                      {isAuthenticated && (
                        <button
                          className={`flex-1 py-3 px-4 border-2 rounded-xl transition-colors ${
                            isFavorite 
                              ? 'border-red-200 text-red-600 hover:border-red-300' 
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => (isFavorite ? favRemove.mutate() : favAdd.mutate())}
                          disabled={favAdd.isPending || favRemove.isPending}
                        >
                          <svg className="w-5 h-5 mx-auto" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Tingkat Kesulitan</span>
                      <span className="font-medium capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Durasi</span>
                      <span className="font-medium">{course.duration} menit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Jumlah Materi</span>
                      <span className="font-medium">{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Akses Selamanya</span>
                      <span className="font-medium text-green-600">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Curriculum */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kurikulum Kursus</h2>
              
              <div className="space-y-3">
                {visibleLessons.map((ls, idx) => (
                  <div key={ls.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold text-sm">
                      {(lessons.findIndex(l => l.id === ls.id))+1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ls.title}</h4>
                      <p className="text-sm text-gray-500">{ls.duration} menit</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7H7a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {canToggleLessons && (
                <button 
                  className="mt-6 w-full py-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowAllLessons((v) => !v)}
                >
                  {showAllLessons ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${lessons.length - visibleLessons.length} materi lainnya)`}
                </button>
              )}
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tentang Instruktur</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(course.instructor?.fullName || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{course.instructor?.fullName || 'Unknown Instructor'}</h4>
                  <p className="text-gray-600">Expert Developer & Educator</p>
                  <p className="text-sm text-gray-500 mt-2">Berpengalaman lebih dari 5 tahun dalam mengajar dan mengembangkan kurikulum pembelajaran yang efektif.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Course Features */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Yang Akan Anda Dapatkan</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Akses selamanya</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Sertifikat penyelesaian</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Belajar di mobile & desktop</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Forum diskusi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Related Videos */}
      <div className="container-wide py-12 bg-white">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          Video Tutorial Terkait
        </h3>
        
        {!import.meta.env.VITE_YOUTUBE_API_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Fitur YouTube Tersedia!</h4>
                <p className="text-sm text-yellow-700">
                  Tambahkan <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-xs">VITE_YOUTUBE_API_KEY</code> ke file .env untuk menampilkan video tutorial terkait dari YouTube.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {import.meta.env.VITE_YOUTUBE_API_KEY && youtubeLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <LoadingSpinner size="small" />
              <span>Memuat video terkait...</span>
            </div>
          </div>
        )}
        
        {import.meta.env.VITE_YOUTUBE_API_KEY && !youtubeLoading && youtubeVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600">Tidak ada video terkait untuk kursus ini.</p>
          </div>
        )}
        
        {import.meta.env.VITE_YOUTUBE_API_KEY && !youtubeLoading && youtubeVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {youtubeVideos.slice(0, 8).map((video) => (
              <YouTubeVideoCard
                key={video.id}
                video={video}
                onClick={setSelectedVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Artikel Terkait */}
      <div className="bg-gray-50 py-12">
        <div className="container-wide">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            Artikel Terkait
          </h3>
          
          {!NEWS_API_KEY && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Fitur Artikel Berita Tersedia!</h4>
                  <p className="text-sm text-blue-700">
                    Tambahkan <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">VITE_NEWS_API_KEY</code> ke file .env untuk menampilkan artikel terkait.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {NEWS_API_KEY && relatedLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <LoadingSpinner size="small" />
                <span>Memuat artikel...</span>
              </div>
            </div>
          )}
          
          {NEWS_API_KEY && !relatedLoading && relatedNews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-600">Belum ada artikel terkait untuk topik ini.</p>
            </div>
          )}
          
          {NEWS_API_KEY && !relatedLoading && relatedNews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedNews.map((article) => (
                <a 
                  key={article.url} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                >
                  {article.urlToImage && (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                    {article.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{article.source?.name}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* YouTube Video Modal */}
      {selectedVideo && (
        <YouTubeVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
