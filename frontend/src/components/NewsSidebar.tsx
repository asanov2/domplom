import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'
import type { NewsItem } from '../types'

type Tab = 'latest' | 'popular'

export default function NewsSidebar() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('latest')

  const { data: latest } = useQuery<{ items: NewsItem[] }>({
    queryKey: ['news-latest-sidebar'],
    queryFn: async () => (await api.get('/news/?page=1&per_page=5')).data,
  })

  const { data: popularWeek } = useQuery<NewsItem[]>({
    queryKey: ['popular-week'],
    queryFn: async () => (await api.get('/news/popular-week')).data,
  })

  const items = tab === 'latest' ? (latest?.items || []) : (popularWeek || [])

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('latest')}
          className={`flex-1 relative py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            tab === 'latest'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('sidebar.latest', 'Последние')}
          </span>
        </button>
        <button
          onClick={() => setTab('popular')}
          className={`flex-1 relative py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
            tab === 'popular'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            {t('sidebar.popularWeek', 'Популярные')}
          </span>
        </button>
      </div>

      {/* News list */}
      <div className="space-y-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        {items.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <div className="border-t border-gray-100 dark:border-gray-800 my-3" />}
            <SidebarCard news={item} index={index + 1} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">{t('home.noNews', 'Нет новостей')}</p>
        )}
      </div>
    </aside>
  )
}

function SidebarCard({ news, index }: { news: NewsItem; index: number }) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="flex gap-3 group"
    >
      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 leading-none mt-0.5 w-6 flex-shrink-0">
        {index}
      </span>
      {news.main_image && (
        <img
          src={news.main_image}
          alt={news.title}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {news.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{news.published_at ? formatDate(news.published_at) : ''}</span>
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {news.views_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
