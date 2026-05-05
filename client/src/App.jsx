import React, { useState, useEffect } from 'react';
import './App.css';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';
import PublicMap from './pages/PublicMap';
import HelpCenter from './pages/HelpCenter';
import PnudLogin from './pages/PnudLogin';
import Dashboard from './pages/Dashboard';
import { LanguageProvider, useTranslation } from './services/i18n';
import { 
  AlertCircle, 
  Map as MapIcon, 
  Clock, 
  HelpCircle, 
  Globe,
  RefreshCw
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { v4 as uuidv4 } from 'uuid';

function AppContent() {
  const [path, setPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('map'); // map, report, history, help
  const { lang, setLang } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('alerto_token'));

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Periodic Update Check (Every 60 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      updateServiceWorker(true);
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateServiceWorker]);

  // Initialize Local User ID
  useEffect(() => {
    if (!localStorage.getItem('alerto_user_id')) {
      localStorage.setItem('alerto_user_id', uuidv4());
    }
    
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPath('/pnud');
    window.history.pushState({}, '', '/pnud');
  };

  const handleLogout = () => {
    localStorage.removeItem('alerto_token');
    setIsAuthenticated(false);
    setPath('/');
    window.history.pushState({}, '', '/');
  };

  // --- ADMIN VIEW (PNUD) ---
  if (path === '/pnud') {
    if (!isAuthenticated) {
      return <PnudLogin onBack={() => { setPath('/'); window.history.pushState({}, '', '/'); }} onLoginSuccess={handleLoginSuccess} />;
    }
    return <Dashboard lang={lang} onLogout={handleLogout} />;
  }

  // --- CITIZEN VIEW (MAIN) ---
  return (
    <div className="app-container">
      {(offlineReady || needRefresh) && (
        <div className="pwa-toast">
          <div className="message">
            {offlineReady ? <span>App prête pour l'usage hors-ligne</span> : <span>Nouvelle version disponible !</span>}
          </div>
          {needRefresh && <button onClick={() => updateServiceWorker(true)}>Mettre à jour</button>}
          <button onClick={() => { setOfflineReady(false); setNeedRefresh(false); }}>Fermer</button>
        </div>
      )}
      
      {/* Global Language Switcher (Floating) */}
      <div className="global-lang-overlay">
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="minimal-select">
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="ar">AR</option>
          <option value="zh">ZH</option>
          <option value="ru">RU</option>
        </select>
      </div>
      
      <main className="main-content">
        {activeTab === 'map' && <PublicMap lang={lang} />}
        {activeTab === 'report' && <SubmitReport lang={lang} />}
        {activeTab === 'history' && <MyReports lang={lang} />}
        {activeTab === 'help' && (
          <div className="help-page-wrapper">
             <HelpCenter lang={lang} />
             <div style={{padding: '0 20px 40px'}}>
               <button className="admin-access-btn" onClick={() => { setPath('/pnud'); window.history.pushState({}, '', '/pnud'); }}>
                 <ShieldCheck size={18} style={{marginRight: '10px'}} />
                 Accès Admin / PNUD (Sécurisé)
               </button>
             </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <MapIcon className="nav-icon" />
          <span>Explorer</span>
        </button>
        <button className={`nav-item ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
          <AlertCircle className="nav-icon" />
          <span>Signaler</span>
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Clock className="nav-icon" />
          <span>Mes Alertes</span>
        </button>
        <button className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
          <HelpCircle className="nav-icon" />
          <span>Aide</span>
        </button>
      </nav>

      <style>{`
        .global-lang-overlay {
          position: fixed;
          top: 15px;
          right: 15px;
          z-index: 2000;
        }
        .minimal-select {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.75rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          outline: none;
        }
        .admin-access-btn {
          width: 100%;
          padding: 15px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          color: #64748b;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .main-content {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
