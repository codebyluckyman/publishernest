
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <OrganizationProvider>
      <App />
    </OrganizationProvider>
  </AuthProvider>
);
