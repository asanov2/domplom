import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useToastStore } from '../../store/toastStore'
import BlockEditor from '../../components/admin/BlockEditor'
import LoadingSpinner from '../../components/LoadingSpinner'
import type { NewsDetail, Category } from '../../types'

export default function AdminNewsEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()
  const isEdit = !!id

  const [title, setTitle] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [blocks, setBlocks] = useState<{ type: string; content: string; position: number }[]>([])
  const [uploading, setUploading] = useState(false)

  // Fetch existing news if editing
  const { data: existingNews, isLoading: loadingNews } = useQuery<NewsDetail>({
    queryKey: ['admin-news-edit', id],
    queryFn: async () => (await api.get(`/news/${id}`)).data,
    enabled: isEdit,
  })

  // Fetch all categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories/')).data,
  })

  // Populate form when editing
  useEffect(() => {
    if (existingNews) {
      setTitle(existingNews.title)
      setPreviewText(existingNews.preview_text)
      setMainImage(existingNews.main_image || '')
      setIsPublished(existingNews.is_published)
      setSelectedCategories(existingNews.categories.map((c) => c.id))
    }
  }, [existingNews])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        preview_text: previewText,
        content: '',
        main_image: mainImage || null,
        is_published: isPublished,
        category_ids: selectedCategories,
        blocks,
      }
      if (isEdit) {
        await api.put(`/news/${id}`, payload)
      } else {
        await api.post('/news/', payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['popular-today'] })
      addToast(isEdit ? t('toast.newsUpdated', 'Новость обновлена') : t('toast.newsCreated', 'Новость создана'))
      navigate('/admin/news')
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload/image', formData)
      setMainImage(data.file.url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    )
  }

  if (isEdit && loadingNews) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        {isEdit ? t('admin.editNews') : t('admin.createNews')}
      </h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.newsTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Preview text */}
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.previewText')}</label>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Main image */}
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.mainImage')}</label>
          <div className="flex items-center gap-4">
            <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">
              {uploading ? t('common.loading') : t('admin.uploadImage')}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {mainImage && (
              <div className="flex items-center gap-2">
                <img src={mainImage} alt="" className="h-16 w-24 object-cover rounded" />
                <button
                  onClick={() => setMainImage('')}
                  className="text-red-500 text-sm hover:underline"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('admin.selectCategories')}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
          <span className="text-sm font-medium">
            {isPublished ? t('admin.published') : t('admin.draft')}
          </span>
        </div>

        {/* Block Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('admin.content')}</label>
          <BlockEditor
            initialBlocks={existingNews?.blocks}
            onSave={setBlocks}
          />
        </div>

        {/* Save button */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !title.trim()}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saveMutation.isPending ? t('common.loading') : t('admin.save')}
          </button>
          <button
            onClick={() => navigate('/admin/news')}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        {saveMutation.isError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
            {t('common.error')}
          </div>
        )}
      </div>
    </div>
  )
}
