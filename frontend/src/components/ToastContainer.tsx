import { useToastStore } from '../store/toastStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up flex items-center gap-3 min-w-[200px]"
        >
          <svg className="w-4 h-4 text-green-400 dark:text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 ml-2"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
