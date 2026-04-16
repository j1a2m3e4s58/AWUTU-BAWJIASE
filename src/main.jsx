import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme')
  const prefersDark = storedTheme ? storedTheme === 'dark' : true
  document.documentElement.classList.toggle('dark', prefersDark)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
