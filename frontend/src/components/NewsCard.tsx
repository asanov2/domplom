import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { NewsItem } from '../types'

interface Props {
  news: NewsItem
}

export default function NewsCard({ news }: Props) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/news/${news.id}`}
      className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
    >
      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {news.main_image ? (
          <img
            src={news.main_image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {news.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {news.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
          {news.preview_text}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <span>
            {news.published_at
              ? new Date(news.published_at).toLocaleDateString()
              : new Date(news.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
