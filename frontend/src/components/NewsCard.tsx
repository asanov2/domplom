import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../utils/formatDate'
import type { NewsItem } from '../types'

interface Props {
  news: NewsItem
}

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

export default function NewsCard({ news }: Props) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/news/${news.id}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-800 h-full"
    >
      {/* Image with overlay & badges */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        {news.main_image ? (
          <>
            <img
              src={news.main_image}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-106 group-hover:brightness-90 transition-all duration-500"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Category badges — top left */}
        {news.categories.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {news.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-2.5 py-0.5 bg-primary-600 text-white rounded-full font-medium shadow-sm"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Reading time — top right */}
        <div className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-black/40 text-white rounded-full backdrop-blur-sm font-medium">
          {readingTime(news.preview_text)} {t('card.minRead', 'мин')}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {news.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
          {news.preview_text}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Author chip */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 dark:text-primary-400 font-bold" style={{ fontSize: '9px' }}>
                {(news.author.name || news.author.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <span className="truncate max-w-[80px]">{news.author.name || news.author.email}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {news.comments_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {news.views_count}
            </span>
            <span>{formatDate(news.published_at || news.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
