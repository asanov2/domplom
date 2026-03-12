import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import ContentBlockRenderer from '../components/ContentBlockRenderer'
import CommentsSection from '../components/CommentsSection'
import NewsCard from '../components/NewsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import type { NewsDetail, NewsItem } from '../types'

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const { data: news, isLoading } = useQuery<NewsDetail>({
    queryKey: ['news', id],
    queryFn: async () => (await api.get(`/news/${id}`)).data,
    enabled: !!id,
  })

  const { data: similar } = useQuery<NewsItem[]>({
    queryKey: ['similar', id],
    queryFn: async () => (await api.get(`/news/${id}/similar`)).data,
    enabled: !!id,
  })

  const { data: bookmarkStatus } = useQuery<{ bookmarked: boolean }>({
    queryKey: ['bookmark-status', id],
    queryFn: async () => (await api.get(`/bookmarks/${id}/status`)).data,
    enabled: !!id && isAuthenticated,
  })

  const toggleBookmark = useMutation({
    mutationFn: async () => (await api.post(`/bookmarks/${id}`)).data,
    onSuccess: (data: { bookmarked?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', id] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      addToast(data?.bookmarked
        ? t('toast.bookmarkAdded', 'Добавлено в закладки')
        : t('toast.bookmarkRemoved', 'Убрано из закладок'))
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!news) return <div className="text-center py-12">Not found</div>

  return (
    <>
      <Helmet>
        <title>{news.title} - ASANOV NEWS</title>
        <meta name="description" content={news.preview_text} />
      </Helmet>

      {/* Hero image */}
      {news.main_image && (
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <div className="w-full h-[40vh] min-h-[280px] overflow-hidden rounded-2xl">
            <img
              src={news.main_image}
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('news.backToHome')}
        </Link>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {news.categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="text-xs px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">{news.title}</h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span>{news.author.name || news.author.email}</span>
          <span>
            {t('news.publishedAt')}{' '}
            {formatDate(news.published_at || news.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {news.views_count} {t('news.views')}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                addToast(t('share.copied', 'Ссылка скопирована'))
              }}
              className="flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors"
              title={t('share.copy', 'Поделиться')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Bookmark button */}
            {isAuthenticated && (
              <button
                onClick={() => toggleBookmark.mutate()}
                className={`flex items-center gap-1 transition-colors ${
                  bookmarkStatus?.bookmarked
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-primary-600'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={bookmarkStatus?.bookmarked ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content blocks */}
        {news.blocks.length > 0 ? (
          <ContentBlockRenderer blocks={news.blocks} />
        ) : (
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        )}

        {/* Comments */}
        <CommentsSection newsId={id!} />

        {/* Similar news */}
        {similar && similar.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6">{t('news.similarNews')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {similar.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
