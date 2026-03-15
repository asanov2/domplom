import i18n from '../i18n/config'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (date >= todayStart) {
    const label = i18n.t('dates.today', 'сегодня')
    return `${label} ${i18n.t('dates.at', 'в')} ${time}`
  }

  if (date >= yesterdayStart) {
    const label = i18n.t('dates.yesterday', 'вчера')
    return `${label} ${i18n.t('dates.at', 'в')} ${time}`
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
