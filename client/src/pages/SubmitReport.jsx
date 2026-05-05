import React, { useState, useEffect, useRef } from 'react';
import './SubmitReport.css';
import { MapPin, Camera, X, Check, Info, Phone, Mail, Loader2, ChevronRight, AlertTriangle, Zap, HeartPulse, Trash } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { saveReportOffline } from '../services/storage';
import { syncOfflineData } from '../services/sync';
import { API_BASE } from '../services/api';
import { translations } from '../services/i18n';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = `${API_BASE}/reports/`;

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const SubmitReport = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const [formStep, setFormStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 1, 
        infrastructure_type: 'Résidentiel',
        infrastructure_name: '',
        crisis_type: 'Inondation',
        crisis_type_other: '',
        debris_present: 'no',
        text_location: 'Recherche de votre position...',
        contact_phone: '',
        contact_email: '',
        allow_contact: true,
        electricity_status: 50,
        health_services_status: 50,
        urgent_needs: []
    });

    const crisisOptions = [
        { id: 'Inondation', icon: '💧', label: lang === 'fr' ? 'Inondation' : 'Flood' },
        { id: 'Incendie', icon: '🔥', label: lang === 'fr' ? 'Incendie' : 'Fire' },
        { id: 'Accident', icon: '🚗', label: lang === 'fr' ? 'Accident' : 'Accident' },
        { id: 'Séisme', icon: '🏠', label: lang === 'fr' ? 'Séisme' : 'Earthquake' },
        { id: 'Conflit', icon: '⚔️', label: lang === 'fr' ? 'Conflit' : 'Conflict' },
        { id: 'Explosion', icon: '💥', label: lang === 'fr' ? 'Explosion' : 'Explosion' },
        { id: 'Autre', icon: '➕', label: lang === 'fr' ? 'Autre' : 'Other' }
    ];

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        getGPS();
        if (navigator.onLine) syncOfflineData();
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    const getGPS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    try {
                        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        if (res.data && res.data.display_name) {
                            setFormData(prev => ({ ...prev, text_location: res.data.display_name }));
                        }
                    } catch (e) { console.error(e); }
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    };

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const saveToLocalHistory = (report) => {
        const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
        const newEntry = {
            ...report,
            id: Date.now(),
            date: new Date().toISOString(),
            crisis: report.crisis_type === 'Autre' ? report.crisis_type_other : report.crisis_type,
            status: navigator.onLine ? 'sent' : 'pending',
            location: report.text_location
        };
        localStorage.setItem('alerto_my_reports', JSON.stringify([newEntry, ...history]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let imageUrl = "";
        if (selectedImageFile) {
            const uploadData = new FormData();
            uploadData.append('file', selectedImageFile);
            try {
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadData);
                imageUrl = res.data.url;
            } catch (err) { console.error("Upload failed", err); }
        }

        const payload = {
            ...formData,
            image_url: imageUrl,
            damage_level: formData.damage_level === 1 ? 'minime' : formData.damage_level === 2 ? 'partiel' : 'complet',
            location: {
                type: "Point",
                coordinates: location ? [location.lng, location.lat] : [0, 0]
            },
            user_id: localStorage.getItem('alerto_user_id')
        };

        saveToLocalHistory(payload);

        if (navigator.onLine) {
            try {
                await axios.post(API_URL, payload);
                alert("✅ Signalement envoyé !");
                resetForm();
            } catch (error) {
                await saveReportOffline(payload);
                alert("📡 Erreur réseau. Sauvegardé localement.");
            }
        } else {
            await saveReportOffline(payload);
            alert("📡 Mode Hors-ligne : Sauvegardé localement.");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            description: '',
            damage_level: 1,
            infrastructure_type: 'Résidentiel',
            infrastructure_name: '',
            crisis_type: 'Inondation',
            crisis_type_other: '',
            debris_present: 'no',
            text_location: '',
            contact_phone: '',
            contact_email: '',
            allow_contact: true,
            electricity_status: 50,
            health_services_status: 50,
            urgent_needs: []
        });
        setImagePreview(null);
        setSelectedImageFile(null);
        setFormStep(1);
    };

    return (
        <div className="report-container">
            {!isOnline && <div className="offline-banner-top">📡 Mode Hors-Ligne</div>}
            
            <div className="report-card">
                <div className="mini-map-container">
                    {location ? (
                        <MapContainer center={[location.lat, location.lng]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[location.lat, location.lng]} />
                            <ChangeView center={[location.lat, location.lng]} />
                        </MapContainer>
                    ) : (
                        <div className="map-placeholder">
                           <Loader2 className="spinner" />
                           <span>Localisation...</span>
                        </div>
                    )}
                    <div className="address-overlay">
                        <MapPin size={16} color="#0ea5e9" />
                        <span className="address-text">{formData.text_location}</span>
                    </div>
                </div>

                <div className="form-body">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (formStep === 1) setFormStep(2);
                        else handleSubmit(e);
                    }}>
                        {formStep === 1 ? (
                            <>
                                <h2 className="form-section-title">Nouvelle Alerte</h2>
                                
                                <label className="input-label">Type de Crise</label>
                                <div className="crisis-grid">
                                    {crisisOptions.map(opt => (
                                        <div 
                                            key={opt.id} 
                                            className={`crisis-item ${formData.crisis_type === opt.id ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, crisis_type: opt.id})}
                                        >
                                            <div className="crisis-icon-bg">{opt.icon}</div>
                                            <span>{opt.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {formData.crisis_type === 'Autre' && (
                                    <input 
                                        type="text" 
                                        className="input-modern" 
                                        placeholder="Quelle crise ?"
                                        value={formData.crisis_type_other}
                                        onChange={(e) => setFormData({...formData, crisis_type_other: e.target.value})}
                                        required
                                    />
                                )}

                                <div className="input-group">
                                    <label className="input-label">Type d'Infrastructure</label>
                                    <select 
                                        className="input-modern"
                                        value={formData.infrastructure_type}
                                        onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}
                                    >
                                        <option>Résidentiel</option>
                                        <option>Commercial</option>
                                        <option>Gouvernemental</option>
                                        <option>Services Publics</option>
                                        <option>Transport</option>
                                        <option>Communautaire</option>
                                    </select>
                                </div>

                                <label className="input-label">Preuve Visuelle</label>
                                <div className="photo-box" onClick={() => document.getElementById('photo-input').click()}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <>
                                            <Camera size={32} />
                                            <span style={{fontSize: '0.8rem'}}>Capturer une photo</span>
                                        </>
                                    )}
                                    <input id="photo-input" type="file" accept="image/*" capture="environment" hidden onChange={handleImageCapture} />
                                </div>

                                <div style={{marginTop: '20px'}}>
                                    <label className="input-label">Description</label>
                                    <textarea 
                                        className="input-modern" 
                                        rows="3" 
                                        placeholder="Décrivez les dégâts..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="form-section-title">Analyse Tactique</h2>
                                
                                <div className="slider-group">
                                    <label className="input-label"><Zap size={14}/> Électricité</label>
                                    <input type="range" min="0" max="100" value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>Coupé</span><span>Stable</span></div>
                                </div>

                                <div className="slider-group">
                                    <label className="input-label"><HeartPulse size={14}/> Santé</label>
                                    <input type="range" min="0" max="100" value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>Indispo.</span><span>OK</span></div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label"><Trash size={14}/> Débris à déblayer ?</label>
                                    <select 
                                        className="input-modern"
                                        value={formData.debris_present}
                                        onChange={(e) => setFormData({...formData, debris_present: e.target.value})}
                                    >
                                        <option value="no">Non, accès dégagé</option>
                                        <option value="yes">Oui, accès bloqué</option>
                                    </select>
                                </div>

                                <div className="contact-card-modern">
                                    <p className="card-subtitle">Contact pour les secours</p>
                                    <div className="input-with-icon">
                                        <Phone size={14} className="input-icon" />
                                        <input type="tel" className="input-modern-clean" placeholder="Numéro de téléphone" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                                    </div>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={formData.allow_contact} onChange={(e) => setFormData({...formData, allow_contact: e.target.checked})} />
                                        J'accepte d'être contacté
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="btn-row">
                            {formStep === 2 && (
                                <button type="button" className="btn-back" onClick={() => setFormStep(1)}>
                                    Retour
                                </button>
                            )}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : (formStep === 1 ? 'Suivant' : 'Envoyer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .offline-banner-top { background: #fffbeb; color: #f59e0b; text-align: center; padding: 10px; font-size: 0.75rem; font-weight: 800; border-radius: 12px; margin-bottom: 15px; border: 1px solid #fef3c7; }
                .input-group { margin-bottom: 15px; }
                .input-label { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 8px; }
                .btn-row { display: flex; gap: 12px; margin-top: 25px; }
                .btn-back { flex: 1; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; font-weight: 700; color: #64748b; cursor: pointer; }
                .contact-card-modern { background: #f8fafc; padding: 15px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 20px; }
                .card-subtitle { font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 12px; }
                .input-with-icon { position: relative; margin-bottom: 12px; }
                .input-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
                .input-modern-clean { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #cbd5e1; border-radius: 10px; font-family: inherit; font-size: 0.9rem; }
                .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; color: #64748b; font-weight: 600; cursor: pointer; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SubmitReport;
