import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: tokenData } = await api.post('/auth/login', { email, password })
      // Get user info
      const token = tokenData.access_token
      localStorage.setItem('token', token)
      const { data: user } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      login(token, user)
      navigate('/')
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.loginTitle')} - ASANOV NEWS</title>
      </Helmet>

      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">{t('auth.loginTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? t('common.loading') : t('auth.loginBtn')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            {t('auth.registerBtn')}
          </Link>
        </p>
      </div>
    </>
  )
}
