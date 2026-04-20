import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ArrowLeft, Loader2, User as UserIcon } from 'lucide-react';
import './PnudLogin.css';

const API_BASE = `http://${window.location.hostname}:8000`;

const PnudLogin = ({ onBack, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Utilisation de FormData car OAuth2PasswordRequestForm côté backend attend x-www-form-urlencoded
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(`${API_BASE}/auth/login`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { access_token, user } = response.data;
            
            // Stockage persistant
            localStorage.setItem('alerto_token', access_token);
            localStorage.setItem('alerto_user', JSON.stringify(user));

            onLoginSuccess(user);
        } catch (err) {
            console.error("Erreur de connexion:", err);
            setError(err.response?.data?.detail || "Identifiants invalides. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
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
                <p>Identifiez-vous pour accéder au centre de commande ALERTO.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-with-icon">
                        <UserIcon size={18} className="icon" />
                        <input 
                            type="text" 
                            placeholder="Nom d'utilisateur"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="input-with-icon">
                        <Lock size={18} className="icon" />
                        <input 
                            type="password" 
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={error ? 'error' : ''}
                            required
                        />
                    </div>

                    {error && <p className="error-msg">{error}</p>}
                    
                    <button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Débloquer le Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PnudLogin;
