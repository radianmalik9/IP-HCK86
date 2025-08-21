import React from 'react';
import PageHeader from '../components/PageHeader';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function DashboardPage() {
  useDocumentTitle('Dashboard · Smart Learning');
  
  const stats = [
    {
      name: 'Total Kursus',
      value: '4',
      change: '+12%',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'blue'
    },
    {
      name: 'Progress Rata-rata',
      value: '62%',
      change: '+8%',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'emerald'
    },
    {
      name: 'Jam Belajar',
      value: '28',
      change: '+16h',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    }
  ];

  const recentActivity = [
    { course: 'React Fundamentals', action: 'Menyelesaikan lesson 5', time: '2 jam lalu' },
    { course: 'JavaScript ES6', action: 'Memulai lesson 3', time: '1 hari lalu' },
    { course: 'CSS Grid & Flexbox', action: 'Menyelesaikan quiz', time: '2 hari lalu' },
    { course: 'Node.js Basics', action: 'Bergabung dengan kursus', time: '3 hari lalu' }
  ];

  const getStatColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-wide">
        <PageHeader 
          title="Dashboard" 
          subtitle="Selamat datang kembali! Lihat progres belajar Anda hari ini." 
        />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-xl ${getStatColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.course}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Minggu Ini</h3>
            <div className="space-y-4">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, index) => {
                const progress = Math.floor(Math.random() * 100);
                return (
                  <div key={day} className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">{day}</div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-sm text-gray-600 text-right">{progress}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Jelajahi Kursus', icon: '📚', href: '/courses' },
            { title: 'AI Assistant', icon: '🤖', href: '/ai' },
            { title: 'Pembelajaran Saya', icon: '🎓', href: '/learn' },
            { title: 'Profil', icon: '👤', href: '/profile' }
          ].map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.title}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
