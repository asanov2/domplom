import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import NewsCard from '../components/NewsCard'
import { useAuthStore } from '../store/authStore'
import type { Bookmark } from '../types'

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 skeleton rounded-full" />
        <div className="h-5 skeleton rounded-lg" />
        <div className="h-4 skeleton rounded-lg" />
        <div className="h-4 w-3/4 skeleton rounded-lg" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-24 skeleton rounded-full" />
          <div className="h-3 w-16 skeleton rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function BookmarksPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  const { data: bookmarks, isLoading, isError } = useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => (await api.get('/bookmarks/')).data,
    enabled: isAuthenticated,
  })

  return (
    <>
      <Helmet>
        <title>{t('bookmarks.title')} - ASANOV NEWS</title>
      </Helmet>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-14 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{t('bookmarks.title')}</h1>
            {!isLoading && !isError && bookmarks && (
              <p className="text-primary-200 text-sm mt-1">
                {bookmarks.length} {t('bookmarks.saved', 'сохранённых статей')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Loading — skeleton grid */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
              {t('bookmarks.error', 'Не удалось загрузить закладки')}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {t('bookmarks.retryHint', 'Проверьте соединение и попробуйте снова')}
            </p>
          </div>
        )}

        {/* Staggered card grid */}
        {!isLoading && !isError && bookmarks && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-grid">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="animate-card-in">
                <NewsCard news={bm.news} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && bookmarks && bookmarks.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-300 dark:text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-semibold text-xl">{t('bookmarks.empty')}</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
              {t('bookmarks.emptyHint', 'Нажмите на закладку на любой статье, чтобы сохранить её здесь')}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
