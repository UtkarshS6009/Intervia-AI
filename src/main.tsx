import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against WebSocket HMR closure notifications in sandboxed iframe runtime
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    (String(event.reason).includes('WebSocket') ||
      String(event.reason?.message).includes('WebSocket') ||
      String(event.reason).includes('closed without opened'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
