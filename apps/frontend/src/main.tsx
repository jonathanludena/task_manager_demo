import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './core/router'
import { ThemeProvider } from './presentation/components/atoms/ThemeProvider'
import './index.css'

async function startApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./test/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  )
}

startApp()
