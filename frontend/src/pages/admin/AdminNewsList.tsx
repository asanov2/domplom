import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { NewsPaginated, Category } from '../../types'

export default function AdminNewsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null) // null = all
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const buildUrl = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', '20')
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedStatus !== null) {
      params.set('is_published', String(selectedStatus))
    } else {
      params.set('show_all', 'true')
    }
    return `/news/?${params.toString()}`
  }

  const { data, isLoading } = useQuery<NewsPaginated>({
    queryKey: ['admin-news', page, selectedCategory, selectedStatus],
    queryFn: async () => (await api.get(buildUrl())).data,
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories/')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/news/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['popular-today'] })
      queryClient.invalidateQueries({ queryKey: ['popular-week'] })
      queryClient.invalidateQueries({ queryKey: ['news-latest-sidebar'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      setDeleteId(null)
    },
  })

  const handleStatusFilter = (status: boolean | null) => {
    setSelectedStatus(prev => prev === status ? null : status)
    setPage(1)
  }

  const handleCategoryFilter = (slug: string | null) => {
    setSelectedCategory(slug)
    setCategoryDropdownOpen(false)
    setPage(1)
  }

  const selectedCategoryName = categories?.find(c => c.slug === selectedCategory)?.name

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.news')}</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              Всего: <span className="font-medium text-gray-700 dark:text-gray-300">{data.total}</span>
            </p>
          )}
        </div>
        <Link
          to="/admin/news/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.createNews')}
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Status buttons */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleStatusFilter(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedStatus === true
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === true ? 'bg-white' : 'bg-green-500'}`} />
            Опубликовано
          </button>
          <button
            onClick={() => handleStatusFilter(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedStatus === false
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === false ? 'bg-white' : 'bg-amber-500'}`} />
            Черновики
          </button>
        </div>

        {/* Category dropdown */}
        {categories && categories.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen(v => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedCategory
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {selectedCategoryName ?? 'Категория'}
              <svg className={`w-3.5 h-3.5 opacity-60 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 min-w-[180px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Все категории
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.slug)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clear filters */}
        {(selectedCategory || selectedStatus !== null) && (
          <button
            onClick={() => { setSelectedCategory(null); setSelectedStatus(null); setPage(1) }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Сбросить
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">{t('admin.newsTitle')}</th>
              <th className="px-4 py-3 font-semibold">Категории</th>
              <th className="px-4 py-3 font-semibold w-28">Статус</th>
              <th className="px-4 py-3 font-semibold w-20">{t('news.views')}</th>
              <th className="px-4 py-3 font-semibold w-28">Дата</th>
              <th className="px-4 py-3 font-semibold w-24 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Новостей не найдено
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-sm line-clamp-1">{item.title}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.length > 0 ? (
                      item.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                        >
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      item.is_published
                        ? 'bg-green-50 dark:bg-green-900/25 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
                        : 'bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {item.is_published ? t('admin.published') : t('admin.draft')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.views_count}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {deleteId === item.id ? (
                      <>
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          title="Подтвердить удаление"
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          title="Отмена"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/admin/news/${item.id}/edit`}
                          title={t('admin.edit')}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          title={t('admin.delete')}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
