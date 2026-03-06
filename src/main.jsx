import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics.js'

initAnalytics()

// iOS keyboard fix: track the true visible height and store it as a CSS variable.
// When the keyboard opens, window.visualViewport.height shrinks to exclude the keyboard.
// We use that value so the app never renders content behind the keyboard.
function syncAppHeight() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', h + 'px');
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncAppHeight);
}
window.addEventListener('resize', syncAppHeight);
syncAppHeight();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
