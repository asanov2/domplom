import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import type { Comment } from '../types'

interface Props {
  newsId: string
}

export default function CommentsSection({ newsId }: Props) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const [content, setContent] = useState('')

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', newsId, sort],
    queryFn: async () => (await api.get(`/comments/news/${newsId}?sort=${sort}`)).data,
  })

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      return (await api.post('/comments/', { news_id: newsId, content: text })).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] })
      setContent('')
    },
  })

  const toggleLike = useMutation({
    mutationFn: async (commentId: string) => {
      return (await api.post(`/comments/${commentId}/like`)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      addComment.mutate(content.trim())
    }
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">
          {t('comments.title')} ({comments.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSort('latest')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              sort === 'latest'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t('comments.sortLatest')}
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              sort === 'popular'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t('comments.sortPopular')}
          </button>
        </div>
      </div>

      {/* Add comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('comments.write')}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            type="submit"
            disabled={!content.trim() || addComment.isPending}
            className="mt-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
          >
            {t('comments.submit')}
          </button>
        </form>
      ) : (
        <p className="text-gray-500 mb-8 text-sm">{t('comments.loginToComment')}</p>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('comments.noComments')}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{comment.user.email}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
              <button
                onClick={() => toggleLike.mutate(comment.id)}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  comment.is_liked_by_me
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                } disabled:cursor-not-allowed`}
              >
                <svg
                  className="w-4 h-4"
                  fill={comment.is_liked_by_me ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {comment.likes_count}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
