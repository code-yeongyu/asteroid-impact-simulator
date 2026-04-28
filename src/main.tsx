import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { RtlProvider } from './components/rtl';
import './styles/base.css';
import './styles/rtl.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <RtlProvider locale="en">
      <App />
    </RtlProvider>
  </StrictMode>,
);
