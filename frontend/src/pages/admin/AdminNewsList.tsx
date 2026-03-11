import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { NewsPaginated } from '../../types'

export default function AdminNewsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<NewsPaginated>({
    queryKey: ['admin-news', page],
    queryFn: async () =>
      (await api.get(`/news/?page=${page}&per_page=20`)).data,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/news/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      setDeleteId(null)
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.news')}</h1>
        <Link
          to="/admin/news/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          + {t('admin.createNews')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">{t('admin.newsTitle')}</th>
              <th className="px-4 py-3 font-medium w-24">Status</th>
              <th className="px-4 py-3 font-medium w-24">{t('news.views')}</th>
              <th className="px-4 py-3 font-medium w-32">Date</th>
              <th className="px-4 py-3 font-medium w-32"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium line-clamp-1">{item.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.is_published
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {item.is_published ? t('admin.published') : t('admin.draft')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.views_count}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/news/${item.id}/edit`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {t('admin.edit')}
                    </Link>
                    {deleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          {t('admin.confirmDelete')}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        {t('admin.delete')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                page === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
