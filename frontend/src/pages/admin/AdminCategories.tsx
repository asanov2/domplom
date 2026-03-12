import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useToastStore } from '../../store/toastStore'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { Category } from '../../types'

export default function AdminCategories() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories/')).data,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/categories/', { name, slug })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setSlug('')
      addToast(t('toast.categoryAdded', 'Категория добавлена'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
      addToast(t('toast.categoryDeleted', 'Категория удалена'))
    },
  })

  const handleNameChange = (value: string) => {
    setName(value)
    // Auto-generate slug
    const autoSlug = value
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
          ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
          н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
          ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
          ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
        }
        return map[char] || char
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setSlug(autoSlug)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">{t('admin.categories')}</h1>

      {/* Create form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('admin.addCategory')}</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('admin.categoryName')}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t('admin.categorySlug')}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || !slug.trim() || createMutation.isPending}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
          >
            {t('admin.addCategory')}
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {categories && categories.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">{t('admin.categoryName')}</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    {deleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(cat.id)}
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
                        onClick={() => setDeleteId(cat.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        {t('admin.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">{t('categories.noNews')}</p>
        )}
      </div>
    </div>
  )
}
