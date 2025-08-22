import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CourseCard from '../components/CourseCard';
import ExternalCourseCard from '../components/ExternalCourseCard';
import { courseAPI } from '../apis/services';
import courseProviderService from '../apis/courseProviders';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function CoursesPage() {
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState('internal'); // 'internal' or 'external'
  useDocumentTitle('Semua Kursus · Smart Learning');
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses', q],
    queryFn: async () => {
      const res = await (q ? courseAPI.searchCourses(q) : courseAPI.getCourses());
      return res.data.data || [];
    },
  });

  // External courses query
  const { data: externalCourses = [], isLoading: externalLoading } = useQuery({
    queryKey: ['external-courses', q],
    queryFn: async () => {
      if (q) {
        return await courseProviderService.searchCourses(q);
      } else {
        return await courseProviderService.getProgrammingCourses();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: activeTab === 'external'
  });

  // Query-aware News panel (appears only when user searches)
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const qForNews = useMemo(() => q.trim(), [q]);
  const { data: news = [], isLoading: newsLoading, isError: newsError } = useQuery({
    queryKey: ['courses-news', qForNews],
    enabled: !!NEWS_API_KEY && !!qForNews,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.set('q', qForNews);
      url.searchParams.set('language', 'id');
      url.searchParams.set('pageSize', '4');
      const res = await fetch(url.toString(), { headers: { 'X-Api-Key': NEWS_API_KEY } });
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message || 'NewsAPI error');
      return json.articles || [];
    },
  });

  return (
    <div className="section-padding">
      <div className="container-wide">
        <PageHeader
          title="Semua Kursus"
          subtitle="Pilih kursus sesuai minat dan tujuan belajar kamu."
          actions={(
            <div className="flex gap-2">
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cari topik atau judul..." className="input-field w-full md:w-64" />
              <button onClick={() => refetch()} className="btn-outline px-4 py-2">Cari</button>
            </div>
          )}
        />

        {/* Course Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('internal')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'internal'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Platform Courses
              </button>
              <button
                onClick={() => setActiveTab('external')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'external'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🌐 Free Courses from Web
              </button>
            </nav>
          </div>
        </div>

        {/* Internal Courses */}
        {activeTab === 'internal' && (
          <>
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

            {!isLoading && !isError && data && (
              <>
                {data.length === 0 ? (
                  <EmptyState
                    icon={q ? '🔎' : '📦'}
                    title={q ? 'Tidak ada hasil' : 'Belum ada kursus' }
                    message={q ? `Tidak ditemukan kursus dengan kata kunci "${q}".` : 'Kursus akan segera hadir. Coba cek tab External untuk kursus gratis dari web.'}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* External Courses */}
        {activeTab === 'external' && (
          <>
            {externalLoading && (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="large" />
                <span className="ml-3 text-gray-600">Loading free courses from the web...</span>
              </div>
            )}

            {!externalLoading && (
              <>
                {externalCourses.length === 0 ? (
                  <EmptyState
                    icon="🌐"
                    title="No external courses found"
                    message="Try another search term, or ensure VITE_YOUTUBE_API_KEY is set in your client .env."
                    actions={(
                      <div className="bg-gray-50 rounded-lg p-2 text-left">
                        <code className="text-xs text-gray-800">VITE_YOUTUBE_API_KEY=your_api_key</code>
                      </div>
                    )}
                  />
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Found {externalCourses.length} free courses from external platforms
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Powered by:</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">YouTube</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Khan Academy</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {externalCourses.map((course) => (
                        <ExternalCourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

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
          // Only show the News side panel here to avoid duplicating the internal courses grid above
          <aside className="mt-8 block">
            {NEWS_API_KEY && qForNews && (
              <div className="bg-white rounded-xl border border-secondary-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Artikel terkait “{qForNews}”</h2>
                  <a href="https://newsapi.org/" target="_blank" rel="noreferrer" className="text-xs text-secondary-600 hover:underline">NewsAPI</a>
                </div>
                {newsLoading && (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 w-full bg-secondary-100 rounded" />
                        <div className="h-3 bg-secondary-100 rounded mt-2 w-5/6" />
                      </div>
                    ))}
                  </div>
                )}
                {!newsLoading && (newsError || news.length === 0) && (
                  <div className="text-xs text-secondary-600">Tidak ada artikel yang relevan saat ini.</div>
                )}
                {!newsLoading && news.length > 0 && (
                  <div className="space-y-3">
                    {news.map((a) => (
                      <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="block group">
                        <div className="flex gap-3">
                          <img src={a.urlToImage || 'https://picsum.photos/seed/courses-news/120/80'} alt="thumb" className="h-16 w-24 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium line-clamp-2 group-hover:underline">{a.title}</p>
                            <p className="text-[11px] text-secondary-600 mt-1">{a.source?.name} • {new Date(a.publishedAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!NEWS_API_KEY && qForNews && (
              <div className="text-xs text-secondary-600">Tambahkan VITE_NEWS_API_KEY di .env untuk menampilkan artikel terkait pencarian.</div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
