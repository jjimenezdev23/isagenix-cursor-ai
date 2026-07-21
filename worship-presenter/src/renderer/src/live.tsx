import React from 'react'
import ReactDOM from 'react-dom/client'
import { LiveOutput } from './live/LiveOutput'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('live-root') as HTMLElement).render(
  <React.StrictMode>
    <LiveOutput />
  </React.StrictMode>
)
