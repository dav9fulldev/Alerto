import React, { useState, useEffect } from 'react';
import SubmitReport from './pages/SubmitReport';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import PnudLogin from './pages/PnudLogin';
import { Map as MapIcon, BarChart3, LogOut } from 'lucide-react';
import './App.css';

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminView, setAdminView] = useState('dash');
  const [lang, setLang] = useState('fr');

  // Écouter les changements d'URL
  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const LangSwitcher = () => {
    const isAdmin = path === '/pnud';
    const options = isAdmin 
      ? [{ v: 'fr', l: 'FR' }, { v: 'en', l: 'EN' }]
      : [
          { v: 'fr', l: 'FR' }, { v: 'en', l: 'EN' }, { v: 'es', l: 'ES' }, 
          { v: 'ar', l: 'AR' }, { v: 'zh', l: 'ZH' }, { v: 'ru', l: 'RU' }
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
                onLoginSuccess={() => setIsAuthenticated(true)} 
             />;
    }

    return (
      <div className="app-container">
        <header className="admin-header">
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
            onClick={() => { 
                setIsAuthenticated(false); 
                window.history.pushState({}, '', '/'); 
                setPath('/'); 
            }}
          >
            <LogOut size={18} />
            <span>Sortir</span>
          </button>
        </nav>
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
    </div>
  );
}

export default App;
