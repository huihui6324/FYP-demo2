import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Ion } from 'cesium';

// 配置 Cesium Ion Access Token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODYzMGVjNy1hOGZmLTQzNTMtOGNiNC0wNmMzMzU3YjJmYzEiLCJpZCI6NDEzOTgzLCJpYXQiOjE3NzUzNzIwMDN9.alkn5QrNOGKTVFb4sx9jufiPe8LiOZQ3ruN0sihnJSU';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
