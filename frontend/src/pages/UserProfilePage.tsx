import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatDate } from '../utils/formatDate'

interface UserPublicProfile {
  id: string
  name: string | null
  avatar: string | null
  created_at: string
  comments_count: number
}

export default function UserProfilePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data: profile, isLoading } = useQuery<UserPublicProfile>({
    queryKey: ['user-profile', id],
    queryFn: async () => (await api.get(`/auth/users/${id}`)).data,
  })

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        {t('common.loading', 'Загрузка...')}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        {t('profile.notFound', 'Пользователь не найден')}
      </div>
    )
  }

  const displayName = profile.name || t('profile.anonymous', 'Пользователь')

  return (
    <>
      <Helmet>
        <title>{displayName} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold">{displayName}</h1>

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 text-center">
            <p>{t('profile.registered', 'Зарегистрирован')}: {formatDate(profile.created_at)}</p>
            <p>{t('profile.commentsCount', 'Комментариев')}: {profile.comments_count}</p>
          </div>
        </div>
      </div>
    </>
  )
}
