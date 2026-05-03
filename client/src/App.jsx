import React, { useState, useEffect } from 'react';
import SubmitReport from './pages/SubmitReport';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import PnudLogin from './pages/PnudLogin';
import { Map as MapIcon, BarChart3, LogOut, HelpCircle } from 'lucide-react';
import HelpGuide from './pages/HelpGuide';
import './App.css';
import { LanguageProvider, useTranslation } from './services/i18n';

function AppContent() {
  const [path, setPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState(null);
  const [adminView, setAdminView] = useState('dash');
  const { lang, setLang } = useTranslation();

  // Vérifier si un utilisateur est déjà connecté au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem('alerto_token');
    const savedUser = localStorage.getItem('alerto_user');
    if (savedToken && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('alerto_token');
    localStorage.removeItem('alerto_user');
    setIsAuthenticated(false);
    setUser(null);
    window.history.pushState({}, '', '/');
    setPath('/');
  };

  const LangSwitcher = () => {
    const isAdmin = path === '/pnud';
    const options = isAdmin 
      ? [{ v: 'fr', l: '🇫🇷' }, { v: 'en', l: '🇬🇧' }]
      : [
          { v: 'fr', l: '🇫🇷' }, { v: 'en', l: '🇬🇧' }, { v: 'es', l: '🇪🇸' }, 
          { v: 'ar', l: '🇸🇦' }, { v: 'zh', l: '🇨🇳' }, { v: 'ru', l: '🇷🇺' }
        ];

    return (
      <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
        {options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
      </select>
    );
  };

  // --- VUE PNUD ---
  if (path === '/pnud') {
    if (!isAuthenticated) {
      return <PnudLogin 
                onBack={() => { window.history.pushState({}, '', '/'); setPath('/'); }} 
                onLoginSuccess={handleLoginSuccess} 
             />;
    }

    return (
      <div className="app-container">
        <header className="admin-header">
           <div className="user-info-badge">
             👤 {user?.username}
           </div>
           <LangSwitcher />
        </header>
        {adminView === 'map' && <MapView lang={lang} />}
        {adminView === 'dash' && <Dashboard lang={lang} />}
        
        <nav className="bottom-nav admin-nav">
          <button 
            className={adminView === 'map' ? 'active' : ''} 
            onClick={() => setAdminView('map')}
          >
            <MapIcon size={18} />
            <span>Carte SIG</span>
          </button>
          <button 
            className={adminView === 'dash' ? 'active' : ''} 
            onClick={() => setAdminView('dash')}
          >
            <BarChart3 size={18} />
            <span>Analyses</span>
          </button>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sortir</span>
          </button>
        </nav>

        {/* Bouton d'Aide Flottant (Admin) */}
        <button 
          className="floating-help-btn" 
          onClick={() => setShowHelp(true)}
          style={{
            position: 'fixed', bottom: '90px', right: '20px',
            width: '50px', height: '50px', borderRadius: '50%',
            backgroundColor: '#f43f5e', color: 'white',
            border: 'none', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 900
          }}
        >
          <HelpCircle size={24} />
        </button>

        {showHelp && <HelpGuide lang={lang} onClose={() => setShowHelp(false)} />}
      </div>
    );
  }

  // --- VUE PAR DÉFAUT (CITOYEN) ---
  return (
    <div className="app-container">
      <header className="citoyen-header">
          <LangSwitcher />
      </header>
      <SubmitReport lang={lang} />
      
      {/* Bouton d'Aide Flottant */}
      <button 
        className="floating-help-btn" 
        onClick={() => setShowHelp(true)}
        title={lang === 'fr' ? 'Besoin d\'aide ?' : 'Need help?'}
        style={{
          position: 'fixed', bottom: '90px', right: '20px',
          width: '50px', height: '50px', borderRadius: '50%',
          backgroundColor: '#f43f5e', color: 'white',
          border: 'none', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 900, transition: 'transform 0.2s ease'
        }}
      >
        <HelpCircle size={24} />
      </button>

      {showHelp && <HelpGuide lang={lang} onClose={() => setShowHelp(false)} />}
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
