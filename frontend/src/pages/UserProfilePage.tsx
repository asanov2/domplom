import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/LoadingSpinner'
import type { PublicProfile } from '../types'

export default function UserProfilePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data: profile, isLoading } = useQuery<PublicProfile>({
    queryKey: ['user-profile', id],
    queryFn: async () => (await api.get(`/auth/users/${id}`)).data,
  })

  if (isLoading) return <LoadingSpinner />

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        {t('profile.notFound')}
      </div>
    )
  }

  const displayName = profile.name || t('profile.anonymous')
  const memberDate = new Date(profile.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <Helmet>
        <title>{displayName} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-0">

        {/* ===== Header ===== */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center ring-4 ring-primary-100 dark:ring-primary-900/30">
              {profile.avatar ? (
                <img src={profile.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-14 h-14 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mt-2 justify-center sm:justify-start">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t('profile.memberSince')} {memberDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mt-1 justify-center sm:justify-start">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{t('profile.commentsCount')}: {profile.comments_count}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stats (if show_stats) ===== */}
        {profile.stats && (
          <>
            <div className="h-4" />
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">{t('profile.activityStats')}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.news_read}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.newsRead')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.comments_count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.commentsWritten')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.reactions_given}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.reactionsGiven')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.reactions_received}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.reactionsReceived')}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ===== Comments ===== */}
        {profile.comments && profile.comments.length > 0 && (
          <>
            <div className="h-4" />
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">{t('comments.title')}</h2>
              </div>

              <div className="space-y-3">
                {profile.comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
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
            </section>
          </>
        )}
      </div>
    </>
  )
}
