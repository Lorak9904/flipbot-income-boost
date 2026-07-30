import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = (
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);

const root = createRoot(document.getElementById('root')!);
document.getElementById('seo-prerender')?.remove();

root.render(
  <StrictMode>
    {app}
  </StrictMode>
);
