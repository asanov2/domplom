import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => i18n.changeLanguage('kz')}
        className={`px-2 py-1 rounded transition-colors ${
          i18n.language === 'kz'
            ? 'bg-primary-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        KZ
      </button>
      <button
        onClick={() => i18n.changeLanguage('ru')}
        className={`px-2 py-1 rounded transition-colors ${
          i18n.language === 'ru'
            ? 'bg-primary-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        RU
      </button>
    </div>
  )
}
