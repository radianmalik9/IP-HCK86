import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/PageHeader';
import useDocumentTitle from '../utils/useDocumentTitle';
import { authAPI } from '../apis/services';
import { updateUser, logout } from '../stores/authSlice';
import { profileUpdateSuccess, handleApiError, accountDeletedSuccess, showConfirm } from '../utils/notifications';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  useDocumentTitle('Profil · Smart Learning');
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: (form.fullName || '').trim(),
        phoneNumber: (form.phoneNumber || '').trim(),
        birthDate: form.birthDate ? form.birthDate : null,
        bio: (form.bio || '').trim(),
      };
      const res = await authAPI.updateProfile(payload);
      if (res?.data?.data) {
        dispatch(updateUser(res.data.data));
        profileUpdateSuccess();
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const result = await showConfirm(
      'Hapus Akun?',
      'Akun akan dihapus permanen dan tindakan ini tidak dapat dibatalkan.',
      'Ya, hapus',
      'Batal'
    );
    if (!result.isConfirmed) return;
    try {
      await authAPI.deleteAccount();
    } catch (_) {}
    await accountDeletedSuccess();
    dispatch(logout());
    window.location.href = '/';
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: '👤' },
    { id: 'learning', name: 'Pembelajaran', icon: '📚' },
    { id: 'achievements', name: 'Pencapaian', icon: '🏆' },
    { id: 'settings', name: 'Pengaturan', icon: '⚙️' }
  ];

  const achievements = [
    { title: 'First Course', description: 'Menyelesaikan kursus pertama', earned: true, date: '15 Jan 2024' },
    { title: 'Quick Learner', description: 'Menyelesaikan 3 lesson dalam 1 hari', earned: true, date: '20 Jan 2024' },
    { title: 'Consistent', description: 'Belajar 7 hari berturut-turut', earned: false, progress: 4 },
    { title: 'Expert', description: 'Menyelesaikan 10 kursus', earned: false, progress: 4 }
  ];

  const learningStats = [
    { label: 'Total Kursus Selesai', value: '4', color: 'blue' },
    { label: 'Jam Belajar Total', value: '48', color: 'green' },
    { label: 'Streak Terpanjang', value: '12 hari', color: 'purple' },
    { label: 'Level Saat Ini', value: 'Intermediate', color: 'orange' }
  ];

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-wide max-w-4xl">
        <PageHeader title="Profil Saya" subtitle="Kelola informasi dan progres belajar Anda" />
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/120'}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user?.fullName || user?.name || 'User'}</h2>
              <p className="text-gray-600 mb-2">{user?.email || 'user@example.com'}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Intermediate Learner
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active Member
                </span>
              </div>
            </div>
            {/* Save button moved to bottom of form to avoid duplicates */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-sm font-medium text-center border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e)=>setForm(f=>({ ...f, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e)=>setForm(f=>({ ...f, phoneNumber: e.target.value }))}
                      placeholder="+62 123 456 7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e)=>setForm(f=>({ ...f, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    value={form.bio}
                    onChange={(e)=>setForm(f=>({ ...f, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" onClick={onSave} disabled={saving}>
                    {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            )}

            {/* Learning Tab */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Statistik Pembelajaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {learningStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Kursus Terbaru</h4>
                  <div className="space-y-3">
                    {['React Fundamentals', 'JavaScript ES6', 'CSS Grid'].map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{course}</span>
                        <span className="text-sm text-gray-600">85% selesai</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Pencapaian & Badge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.earned
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                          🏆
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.earned ? (
                            <p className="text-xs text-green-600 mt-1">Diraih pada {achievement.date}</p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">
                              Progress: {achievement.progress}/10
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Pengaturan Akun</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Notifikasi Email</h4>
                      <p className="text-sm text-gray-600">Terima update kursus dan pembelajaran</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Mode Gelap</h4>
                      <p className="text-sm text-gray-600">Aktifkan tampilan mode gelap</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Privasi Profil</h4>
                      <p className="text-sm text-gray-600">Sembunyikan profil dari pengguna lain</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="border-t pt-6">
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium" onClick={onDelete}>
                    Hapus Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
