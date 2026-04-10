import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';
import './PnudLogin.css';

const PnudLogin = ({ onBack, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulation de vérification sécurisée
        setTimeout(() => {
            if (password === 'pnud_alerto_2026') {
                onLoginSuccess();
            } else {
                setError(true);
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="login-container">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={18} /> Retour
            </button>
            
            <div className="login-card">
                <div className="lock-icon">
                    <Lock size={28} />
                </div>
                <h2>Accès PNUD</h2>
                <p>Veuillez entrer le code d'accréditation du projet pour accéder au centre de commande.</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="password" 
                        placeholder="Code d'accès"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={error ? 'error' : ''}
                        required
                    />
                    {error && <p className="error-msg">Code invalide. Veuillez réessayer.</p>}
                    
                    <button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Débloquer le Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PnudLogin;
