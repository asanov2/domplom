import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import NewsCard from '../components/NewsCard'
import NewsSidebar from '../components/NewsSidebar'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import type { NewsPaginated } from '../types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<NewsPaginated>({
    queryKey: ['news', 'category', slug, page],
    queryFn: async () =>
      (await api.get(`/news/?category=${slug}&page=${page}&per_page=9`)).data,
    enabled: !!slug,
  })

  return (
    <>
      <Helmet>
        <title>{slug} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 capitalize">{slug?.replace(/-/g, ' ')}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <LoadingSpinner />
            ) : data && data.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-center text-gray-500 py-12">{t('categories.noNews')}</p>
            )}
          </div>

          <NewsSidebar />
        </div>
      </div>
    </>
  )
}
