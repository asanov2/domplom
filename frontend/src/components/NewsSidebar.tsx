import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'
import type { NewsItem } from '../types'

export default function NewsSidebar() {
  const { t } = useTranslation()

  const { data: latest } = useQuery<{ items: NewsItem[] }>({
    queryKey: ['news-latest-sidebar'],
    queryFn: async () => (await api.get('/news/?page=1&per_page=5')).data,
  })

  const { data: popularWeek } = useQuery<NewsItem[]>({
    queryKey: ['popular-week'],
    queryFn: async () => (await api.get('/news/popular-week')).data,
  })

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
      {/* Latest */}
      <div>
        <h3 className="text-lg font-bold mb-4">{t('sidebar.latest', 'Последние')}</h3>
        <div className="space-y-3">
          {latest?.items?.map((item) => (
            <SidebarCard key={item.id} news={item} />
          ))}
        </div>
      </div>

      {/* Popular this week */}
      <div>
        <h3 className="text-lg font-bold mb-4">{t('sidebar.popularWeek', 'Популярные за неделю')}</h3>
        <div className="space-y-3">
          {popularWeek?.map((item) => (
            <SidebarCard key={item.id} news={item} />
          ))}
        </div>
      </div>
    </aside>
  )
}

function SidebarCard({ news }: { news: NewsItem }) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="flex gap-3 group"
    >
      {news.main_image && (
        <img
          src={news.main_image}
          alt={news.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary-600 transition-colors">
          {news.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {news.published_at ? formatDate(news.published_at) : ''}
        </p>
      </div>
    </Link>
  )
}
