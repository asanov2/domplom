import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { formatDate } from '../utils/formatDate'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import type { UserStats, UserComment, RecentRead } from '../types'

type Tab = 'comments' | 'activity' | 'settings'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()
  const { addToast } = useToastStore()
  const [activeTab, setActiveTab] = useState<Tab>('comments')

  // Settings form state
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [birthday, setBirthday] = useState(user?.birthday || '')
  const [gender, setGender] = useState(user?.gender || '')
  const [showStats, setShowStats] = useState(user?.show_stats ?? true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['my-stats'],
    queryFn: async () => (await api.get('/auth/me/stats')).data,
  })

  const { data: comments, isLoading: loadingComments } = useQuery<UserComment[]>({
    queryKey: ['my-comments'],
    queryFn: async () => (await api.get('/auth/me/comments')).data,
  })

  const { data: recentReads, isLoading: loadingReads } = useQuery<RecentRead[]>({
    queryKey: ['my-recent-reads'],
    queryFn: async () => (await api.get('/auth/me/recent-reads')).data,
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload/image', formData)
      if (data?.file?.url) {
        setAvatar(data.file.url)
      }
    } catch {
      addToast(t('common.error'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', {
        name: name || null,
        phone: phone || null,
        avatar: avatar || null,
        birthday: birthday || null,
        gender: gender || null,
        show_stats: showStats,
      })
      setUser(data)
      addToast(t('profile.saved'))
    } catch {
      addToast(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const displayName = user?.name || user?.email || ''
  const memberDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'comments',
      label: t('profile.myComments'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      key: 'activity',
      label: t('profile.activityStats'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: 'settings',
      label: t('profile.settings'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>{t('profile.title')} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* ===== Header: Avatar + Info ===== */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center ring-4 ring-primary-100 dark:ring-primary-900/30">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-bold">{displayName}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1.5 justify-center sm:justify-start">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t('profile.memberSince')} {memberDate}</span>
              </div>
            </div>

            {/* Quick stats badges */}
            <div className="flex gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">{stats?.news_read ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t('profile.newsRead')}</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">{stats?.comments_count ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t('profile.commentsWritten')}</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">{stats?.reactions_received ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t('profile.reactionsReceived')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Tab Navigation ===== */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">

            {/* ===== Comments Tab ===== */}
            {activeTab === 'comments' && (
              <div>
                {loadingComments ? (
                  <LoadingSpinner />
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.content}</p>
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
                          <span>{formatDate(c.created_at)}</span>
                          {c.news_title && (
                            <Link
                              to={`/news/${c.news_id}`}
                              className="text-primary-600 hover:underline truncate max-w-[250px]"
                            >
                              {t('profile.toNews')}: {c.news_title}
                            </Link>
                          )}
                          <span className="flex items-center gap-1 ml-auto">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {c.likes_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">{t('profile.noComments')}</p>
                )}
              </div>
            )}

            {/* ===== Activity Tab ===== */}
            {activeTab === 'activity' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold">{stats?.news_read ?? 0}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t('profile.newsRead')}</p>
                  </div>

                  <div className="bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold">{stats?.comments_count ?? 0}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t('profile.commentsWritten')}</p>
                  </div>

                  <div className="bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold">{stats?.reactions_given ?? 0}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t('profile.reactionsGiven')}</p>
                  </div>

                  <div className="bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold">{stats?.reactions_received ?? 0}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t('profile.reactionsReceived')}</p>
                  </div>
                </div>

                {/* Show stats toggle */}
                <div className="flex items-center gap-3 px-1">
                  <button
                    type="button"
                    onClick={() => setShowStats(!showStats)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      showStats ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        showStats ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('profile.showStatsToggle')}</span>
                </div>

                {/* Recent Reads */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t('profile.recentReads')}
                  </h3>

                  {loadingReads ? (
                    <LoadingSpinner />
                  ) : recentReads && recentReads.length > 0 ? (
                    <div className="space-y-2">
                      {recentReads.map((item) => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="flex items-center gap-3 bg-gray-100/70 dark:bg-gray-800/50 rounded-xl p-3 hover:bg-gray-200/70 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {item.main_image ? (
                              <img src={item.main_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium group-hover:text-primary-600 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.viewed_at ? formatDate(item.viewed_at) : ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-6">{t('profile.noRecentReads')}</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== Settings Tab ===== */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('profile.name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('profile.namePlaceholder')}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('auth.email')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 cursor-not-allowed text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('profile.phone')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('profile.birthday')}</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  {/* Gender */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('profile.gender')}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">{t('profile.genderPlaceholder')}</option>
                      <option value="male">{t('profile.genderMale')}</option>
                      <option value="female">{t('profile.genderFemale')}</option>
                      <option value="other">{t('profile.genderOther')}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium text-sm"
                >
                  {saving ? t('common.loading') : t('profile.save')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
