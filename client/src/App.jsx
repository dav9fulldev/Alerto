import React, { useState, useEffect } from 'react';
import './App.css';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';
import PublicMap from './pages/PublicMap';
import HelpCenter from './pages/HelpCenter';
import PnudLogin from './pages/PnudLogin';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { LanguageProvider, useTranslation } from './services/i18n';
import { 
  AlertCircle, 
  Map as MapIcon, 
  Clock, 
  HelpCircle, 
  Globe,
  RefreshCw,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { v4 as uuidv4 } from 'uuid';

function AppContent() {
  const [path, setPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, lang, setLang } = useTranslation();
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
      
      <div className="layout-main full-width-premium">
        {/* Mobile Sidebar / Drawer */}
        {isMenuOpen && (
          <div className="mobile-sidebar-overlay" onClick={() => setIsMenuOpen(false)}>
            <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <ShieldCheck size={32} color="#ef4444" />
                <span>ALERTO</span>
              </div>
              <nav className="drawer-nav">
                <button className={`drawer-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}>
                  <ShieldCheck size={20} /> <span>ACCUEIL</span>
                </button>
                <button className={`drawer-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => { setActiveTab('map'); setIsMenuOpen(false); }}>
                  <MapIcon size={20} /> <span>EXPLORER</span>
                </button>
                <button className={`drawer-item ${activeTab === 'report' ? 'active' : ''}`} onClick={() => { setActiveTab('report'); setIsMenuOpen(false); }}>
                  <AlertCircle size={20} /> <span>SIGNALER</span>
                </button>
                <button className={`drawer-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }}>
                  <Clock size={20} /> <span>MES ALERTES</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        
        <main className="main-content">
          {activeTab === 'home' && <Home onNavigate={setActiveTab} onMenuClick={() => setIsMenuOpen(true)} />}
          {activeTab === 'map' && <PublicMap lang={lang} />}
          {activeTab === 'report' && <SubmitReport lang={lang} onClose={() => setActiveTab('home')} />}
          {activeTab === 'history' && <MyReports lang={lang} onBack={() => setActiveTab('home')} />}
          {activeTab === 'profile' && (
            <div className="profile-placeholder modern-card" style={{margin: '40px', padding: '60px', textAlign: 'center'}}>
               <UserIcon size={80} color="#2dd4bf" style={{marginBottom: '20px'}} />
               <h2 style={{fontWeight: 900}}>{t.nav.profile}</h2>
               <p style={{color: '#64748b', marginTop: '10px'}}>Gestion du compte citoyen ALERTO</p>
               <button className="btn-primary" style={{marginTop: '30px', width: 'auto'}} onClick={() => alert('Bientôt disponible')}>Modifier mes infos</button>
            </div>
          )}
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

        {/* Bottom Nav removed for premium brand parity */}
      </div>

      <style>{`
.mobile-sidebar-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(2, 6, 23, 0.7);
    backdrop-filter: blur(8px);
    z-index: 5000;
    display: flex;
}

.mobile-drawer {
    width: 280px;
    height: 100%;
    background: #0f172a;
    box-shadow: 15px 0 50px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    padding: 30px;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
}

.drawer-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 50px;
}

.drawer-header span {
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
}

.drawer-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.drawer-item {
    background: none;
    border: none;
    padding: 18px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
    color: #94a3b8;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.drawer-item.active {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.drawer-item:active {
    background: rgba(255, 255, 255, 0.05);
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
