import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import NewsCard from '../components/NewsCard'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import type { NewsPaginated } from '../types'

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState(q)

  useEffect(() => {
    setQuery(q)
    setPage(1)
  }, [q])

  const { data, isLoading } = useQuery<NewsPaginated>({
    queryKey: ['search', q, page],
    queryFn: async () =>
      (await api.get(`/news/search?q=${encodeURIComponent(q)}&page=${page}&per_page=9`)).data,
    enabled: q.length > 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('search.title')} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('search.title')}</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              {t('header.search')}
            </button>
          </div>
        </form>

        {q && (
          isLoading ? (
            <LoadingSpinner />
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={Math.ceil(data.total / data.per_page)}
                onPageChange={setPage}
              />
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">
              {t('search.noResults')} &laquo;{q}&raquo;
            </p>
          )
        )}
      </div>
    </>
  )
}
