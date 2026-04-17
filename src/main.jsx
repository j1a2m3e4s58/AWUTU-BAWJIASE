import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

if (typeof window !== 'undefined') {
  const redirectedPath = sessionStorage.getItem('spa-redirect-path')
  if (redirectedPath) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (redirectedPath !== currentPath) {
      window.history.replaceState(null, '', redirectedPath)
    }
    sessionStorage.removeItem('spa-redirect-path')
  }

  const storedTheme = localStorage.getItem('theme')
  const prefersDark = storedTheme ? storedTheme === 'dark' : true
  document.documentElement.classList.toggle('dark', prefersDark)

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update().catch(() => {})

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      }).catch(() => {})
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
