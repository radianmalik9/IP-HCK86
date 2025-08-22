import React, { useMemo, useState } from 'react';
import useDocumentTitle from '../utils/useDocumentTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseAPI, enrollmentAPI } from '../apis/services';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  useDocumentTitle('Smart Learning · Belajar dengan AI');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['home-courses'],
    queryFn: async () => {
      const res = await courseAPI.getCourses();
      return (res.data?.data || []).slice(0, 6);
    },
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const res = await courseAPI.getCategories();
      return res.data?.data || [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['my-enrollments-home'],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await enrollmentAPI.getMyEnrollments();
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // NewsAPI integration (client-side; for assignment/demo use)
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const {
    data: news = [],
    isLoading: newsLoading,
    isError: newsError,
  } = useQuery({
    queryKey: ['home-news'],
    enabled: !!NEWS_API_KEY,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.set('q', 'education OR programming OR coding');
      url.searchParams.set('language', 'id');
      url.searchParams.set('pageSize', '6');
      const res = await fetch(url.toString(), { headers: { 'X-Api-Key': NEWS_API_KEY } });
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message || 'NewsAPI error');
      return json.articles || [];
    },
  });

  const firstName = useMemo(() => {
    if (!user?.name) return null;
    return String(user.name).split(' ')[0];
  }, [user]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return navigate('/courses');
    navigate(`/courses?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent"></div>
        
        <div className="relative container-wide py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {isAuthenticated && firstName ? `Selamat datang kembali, ${firstName}!` : 'Platform Pembelajaran AI Terdepan'}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Belajar Lebih 
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Cerdas
                </span>
                dengan AI
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                Revolusi cara belajarmu dengan teknologi AI canggih, kurikulum adaptif, dan mentoring personal untuk mencapai potensi maksimal.
              </p>
              
              <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-4 mb-8" role="search">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari kursus: React, Python, Machine Learning, UI/UX..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-xl"
                  />
                </div>
                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cari Kursus
                </button>
              </form>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-300 group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Jelajahi Kursus
                </Link>
                <Link to="/ai" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Tanya AI Assistant
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop" 
                  alt="Modern Learning Environment" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-6 hidden lg:block transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 hidden lg:block transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50K+</p>
                    <p className="text-sm text-gray-600">Happy Learners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Continue Learning */}
      {isAuthenticated && (
        <section className="py-16 bg-gray-50">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Lanjutkan Perjalanan Belajar</h2>
                <p className="text-gray-600 mt-2">Kembali ke kursus yang sedang kamu ikuti</p>
              </div>
              <Link to="/learn" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {enrollLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-2 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!enrollLoading && enrollments?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.slice(0, 3).map((en) => {
                  const c = en.Course || en.course || {};
                  const progress = Math.round(en.progressPercent ?? en.progress ?? 0);
                  return (
                    <Link key={c.id || en.id} to={`/learn/${c.id || en.courseId}`} className="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative overflow-hidden">
                        <img src={c.thumbnail || 'https://via.placeholder.com/400x240'} alt={c.title} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-4 right-4">
                          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800">
                            {progress}% Complete
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{c.title || 'Kursus'}</h3>
                        <p className="text-sm text-gray-600 mb-4">Lanjutkan dari yang terakhir kamu pelajari</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {!enrollLoading && (!enrollments || enrollments.length === 0) && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mulai Petualangan Belajar</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Belum ada kursus yang kamu ikuti. Jelajahi ribuan kursus berkualitas dan mulai belajar sekarang!</p>
                <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Jelajahi Kursus
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Top Categories */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Pembelajaran Populer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Temukan bidang yang paling diminati dan mulai perjalanan belajarmu dari kategori yang tepat</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {catsLoading && (
              [...Array(12)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />
              ))
            )}
            {!catsLoading && categories.slice(0, 12).map((cat, index) => {
              const colors = [
                'from-blue-500 to-purple-600',
                'from-green-500 to-teal-600', 
                'from-orange-500 to-red-600',
                'from-purple-500 to-pink-600',
                'from-indigo-500 to-blue-600',
                'from-teal-500 to-green-600'
              ];
              return (
                <Link 
                  key={cat.id || cat} 
                  to={`/courses?category=${encodeURIComponent(cat.slug || cat)}`} 
                  className="group relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{backgroundImage: `linear-gradient(135deg, ${colors[index % colors.length].split(' ')[0]} 0%, ${colors[index % colors.length].split(' ')[2]} 100%)`}}
                >
                  <div className="relative z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-sm">{cat.name || String(cat)}</h3>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bagaimana Smart Learning Bekerja?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Proses pembelajaran yang dirancang khusus untuk memaksimalkan hasil belajarmu dengan bantuan teknologi AI</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: '🎯', 
                title: 'Pilih Kursus Yang Tepat', 
                description: 'Temukan kursus sesuai minat, level, dan tujuan kariermu dengan sistem rekomendasi AI yang cerdas.',
                color: 'from-blue-500 to-purple-600'
              },
              { 
                icon: '📚', 
                title: 'Belajar Terstruktur & Adaptif', 
                description: 'Ikuti kurikulum yang disesuaikan dengan gaya belajarmu, pantau progres real-time, dan dapatkan feedback instant.',
                color: 'from-green-500 to-teal-600'
              },
              { 
                icon: '🤖', 
                title: 'Bantuan AI 24/7', 
                description: 'Tanya konsep apapun, minta penjelasan materi, atau diskusi dengan AI assistant yang siap membantu kapan saja.',
                color: 'from-orange-500 to-red-600'
              },
            ].map((item, index) => (
              <div key={item.title} className="relative group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center transform group-hover:-translate-y-2">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform -translate-y-1/2 z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Kursus Unggulan</h2>
              <p className="text-gray-600">Pilihan terbaik dari instruktur berpengalaman untuk mengembangkan skillmu</p>
            </div>
            <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors group">
              Lihat Semua Kursus
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.map((course, index) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group block">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                    <div className="relative overflow-hidden">
                      <img 
                        src={course.thumbnail || 'https://via.placeholder.com/400x240'} 
                        alt={course.title} 
                        className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Course Level Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm ${
                          course.level === 'beginner' ? 'bg-green-500/80' :
                          course.level === 'intermediate' ? 'bg-yellow-500/80' : 'bg-red-500/80'
                        }`}>
                          {course.level === 'beginner' ? 'Pemula' : 
                           course.level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                        </span>
                      </div>
                      
                      {/* Featured Badge */}
                      {index < 3 && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                            ⭐ Unggulan
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {course.instructor?.fullName?.[0] || 'I'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {course.instructor?.fullName || 'Instructor'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-yellow-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration}m
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            2.1k siswa
                          </span>
                        </div>
                        
                        <div className="font-bold text-lg text-gray-900">
                          {Number(course.price) === 0 ? (
                            <span className="text-green-600">Gratis</span>
                          ) : (
                            <span>Rp {course.price}k</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News & Articles */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Berita & Artikel Terkini</h2>
              <p className="text-gray-600">Update terbaru seputar teknologi, pendidikan, dan dunia programming</p>
            </div>
            <a 
              href="https://newsapi.org/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Powered by NewsAPI
            </a>
          </div>

          {!NEWS_API_KEY && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fitur Berita Tersedia</h3>
              <p className="text-gray-600">Tambahkan <code className="bg-blue-100 px-2 py-1 rounded text-sm">VITE_NEWS_API_KEY</code> di file .env untuk menampilkan berita terkini.</p>
            </div>
          )}

          {NEWS_API_KEY && newsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {NEWS_API_KEY && !newsLoading && (newsError || news.length === 0) && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-600">Tidak dapat memuat berita saat ini. Silakan coba lagi nanti.</p>
            </div>
          )}

          {NEWS_API_KEY && !newsLoading && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article, index) => (
                <a 
                  key={article.url} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.urlToImage || `https://picsum.photos/seed/news${index}/800/400`} 
                      alt={article.title} 
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {article.source?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                    
                    {article.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative container-wide text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Bergabung dengan 50,000+ pembelajar aktif
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Siap Mulai Perjalanan
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Belajar Impianmu?
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Akses ribuan materi berkualitas tinggi, pantau progres belajarmu secara real-time, dan dapatkan bantuan AI yang siap membimbingmu 24/7 menuju kesuksesan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mulai Belajar Sekarang
              </Link>
              
              <Link 
                to="/ai" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Coba AI Assistant
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50K+</div>
                <div className="text-blue-200 text-sm">Siswa Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-blue-200 text-sm">Kursus Tersedia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-blue-200 text-sm">Tingkat Kepuasan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-blue-200 text-sm">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
