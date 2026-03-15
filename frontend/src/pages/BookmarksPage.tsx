import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import NewsCard from '../components/NewsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Bookmark } from '../types'

export default function BookmarksPage() {
  const { t } = useTranslation()

  const { data: bookmarks, isLoading } = useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => (await api.get('/bookmarks/')).data,
  })

  return (
    <>
      <Helmet>
        <title>{t('bookmarks.title')} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('bookmarks.title')}</h1>

        {isLoading ? (
          <LoadingSpinner />
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bm) => (
              <NewsCard key={bm.id} news={bm.news} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-gray-500">{t('bookmarks.empty')}</p>
          </div>
        )}
      </div>
    </>
  )
}
