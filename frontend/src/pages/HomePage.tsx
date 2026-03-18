import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'
import NewsCard from '../components/NewsCard'
import NewsSidebar from '../components/NewsSidebar'
import Pagination from '../components/Pagination'
import type { NewsItem, NewsPaginated } from '../types'

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

export default function HomePage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data: popular, isLoading: loadingPopular } = useQuery<NewsItem[]>({
    queryKey: ['popular-today'],
    queryFn: async () => (await api.get('/news/popular-today')).data,
  })

  const { data: newsData, isLoading: loadingNews } = useQuery<NewsPaginated>({
    queryKey: ['news', page],
    queryFn: async () => (await api.get(`/news/?page=${page}&per_page=9`)).data,
  })

  const heroNews = popular?.[0]

  return (
    <>
      <Helmet>
        <title>ASANOV NEWS - {t('home.title')}</title>
      </Helmet>

      {/* Hero Banner */}
      {loadingPopular && !heroNews && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="w-full h-[50vh] min-h-[350px] rounded-2xl skeleton" />
        </div>
      )}

      {heroNews && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <Link
            to={`/news/${heroNews.id}`}
            className="relative block w-full h-[50vh] min-h-[350px] overflow-hidden rounded-2xl group page-enter"
          >
            <div className="absolute inset-0 bg-gray-900">
              {heroNews.main_image && (
                <img
                  src={heroNews.main_image}
                  alt={heroNews.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl">
                <div className="flex gap-2 mb-4">
                  {heroNews.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-3 py-1 bg-primary-600 text-white rounded-full font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 group-hover:text-primary-100 transition-colors duration-300">
                  {heroNews.title}
                </h1>
                <p className="text-base text-gray-300 line-clamp-2 max-w-2xl">
                  {heroNews.preview_text}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span>
                    {heroNews.published_at ? formatDate(heroNews.published_at) : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {heroNews.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {heroNews.views_count}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* News Feed + Sidebar */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {/* Section header with accent line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 bg-primary-600 rounded-full" />
              <h2 className="text-2xl font-bold">{t('home.latestNews')}</h2>
            </div>

            {loadingNews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : newsData && newsData.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 card-grid">
                  {newsData.items.map((item) => (
                    <div key={item.id} className="animate-card-in">
                      <NewsCard news={item} />
                    </div>
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={Math.ceil(newsData.total / newsData.per_page)}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <p className="text-center text-gray-500 py-12">{t('home.noNews')}</p>
            )}
          </div>

          <NewsSidebar />
        </div>
      </section>
    </>
  )
}
