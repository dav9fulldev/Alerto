import React, { useState, useEffect, useRef } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, X, Check, Info, Phone, Mail, Loader2, 
  ChevronRight, AlertTriangle, Zap, HeartPulse, Trash,
  Droplets, Flame, Car, Home, ShieldAlert, Bomb, PlusCircle,
  Construction, Building2, Store, Landmark, Factory, Bus, Users, Palmtree
} from 'lucide-react';
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
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const deferredPrompt = useRef(null);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime', 
        infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
        infrastructure_name: '',
        crisis_type: 'Inondation',
        crisis_type_other: '',
        debris_present: 'no',
        text_location: t.gps_searching || 'GPS...',
        contact_phone: '',
        contact_email: '',
        allow_contact: true,
        electricity_status: 50,
        health_services_status: 50,
        urgent_needs: []
    });

    const crisisOptions = [
        { id: 'Inondation', icon: <Droplets size={24} />, label: lang === 'fr' ? 'Inondation' : 'Flood' },
        { id: 'Incendie', icon: <Flame size={24} />, label: lang === 'fr' ? 'Incendie' : 'Fire' },
        { id: 'Accident', icon: <Car size={24} />, label: lang === 'fr' ? 'Accident' : 'Accident' },
        { id: 'Séisme', icon: <Home size={24} />, label: lang === 'fr' ? 'Séisme' : 'Earthquake' },
        { id: 'Conflit', icon: <ShieldAlert size={24} />, label: lang === 'fr' ? 'Conflit' : 'Conflict' },
        { id: 'Explosion', icon: <Bomb size={24} />, label: lang === 'fr' ? 'Explosion' : 'Explosion' },
        { id: 'Autre', icon: <PlusCircle size={24} />, label: lang === 'fr' ? 'Autre' : 'Other' }
    ];

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            deferredPrompt.current = e;
            setShowInstallPrompt(true);
        };

        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        
        getGPS();
        if (navigator.onLine) syncOfflineData();
        
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt.current) return;
        deferredPrompt.current.prompt();
        const { outcome } = await deferredPrompt.current.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted install');
            setShowInstallPrompt(false);
        }
        deferredPrompt.current = null;
    };

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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            if (selectedImageFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedImageFile);
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadData);
                imageUrl = res.data.url;
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

            const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
            const newEntry = { ...payload, id: Date.now(), date: new Date().toISOString(), status: navigator.onLine ? 'sent' : 'pending' };
            localStorage.setItem('alerto_my_reports', JSON.stringify([newEntry, ...history]));

            if (navigator.onLine) {
                await axios.post(API_URL, payload);
                alert(t.online_success);
            } else {
                await saveReportOffline(payload);
                alert(t.offline_success);
            }
            resetForm();
        } catch (error) {
            console.error("Submission error", error);
            alert("Erreur lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            damage_level: 'minime',
            infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
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
            {showInstallPrompt && (
                <div className="install-banner">
                    <span>Installer ALERTO pour un accès hors-ligne rapide</span>
                    <button onClick={handleInstallClick}>Installer</button>
                    <X size={16} onClick={() => setShowInstallPrompt(false)} />
                </div>
            )}
            
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
                           <span>{t.gps_searching}</span>
                        </div>
                    )}
                    <div className="address-overlay">
                        <MapPin size={14} color="#0ea5e9" />
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
                                <h2 className="form-section-title">{t.crisis_label}</h2>
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

                                <div className="input-group">
                                    <label className="input-label">{t.infrastructure_label}</label>
                                    <select 
                                        className="input-modern"
                                        value={formData.infrastructure_type}
                                        onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}
                                    >
                                        {t.options && t.options.infra ? t.options.infra.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        )) : <option>Chargement...</option>}
                                    </select>
                                </div>

                                <label className="input-label">{t.take_photo}</label>
                                <div className="photo-box" onClick={() => document.getElementById('photo-input').click()}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <>
                                            <Camera size={32} color="#94a3b8" />
                                            <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{t.take_photo}</span>
                                        </>
                                    )}
                                    <input id="photo-input" type="file" accept="image/*" capture="environment" hidden onChange={handleImageCapture} />
                                </div>

                                <div style={{marginTop: '20px'}}>
                                    <label className="input-label">{t.description_label}</label>
                                    <textarea 
                                        className="input-modern" 
                                        rows="3" 
                                        placeholder={t.description_placeholder}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="form-section-title">{t.needs}</h2>
                                <div className="slider-group">
                                    <label className="input-label"><Zap size={14}/> {t.electricity}</label>
                                    <input type="range" min="0" max="100" value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>0%</span><span>100%</span></div>
                                </div>

                                <div className="slider-group">
                                    <label className="input-label"><HeartPulse size={14}/> {t.health}</label>
                                    <input type="range" min="0" max="100" value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>0%</span><span>100%</span></div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label"><Construction size={14}/> {t.debris_label}</label>
                                    <select 
                                        className="input-modern"
                                        value={formData.debris_present}
                                        onChange={(e) => setFormData({...formData, debris_present: e.target.value})}
                                    >
                                        <option value="no">{t.options?.debris?.no || 'Non'}</option>
                                        <option value="yes">{t.options?.debris?.yes || 'Oui'}</option>
                                    </select>
                                </div>

                                <div className="contact-card-modern">
                                    <div className="input-with-icon">
                                        <Phone size={14} className="input-icon" />
                                        <input type="tel" className="input-modern-clean" placeholder="Contact Téléphone" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                                    </div>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={formData.allow_contact} onChange={(e) => setFormData({...formData, allow_contact: e.target.checked})} />
                                        Autoriser le contact des secours
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="btn-row">
                            {formStep === 2 && (
                                <button type="button" className="btn-back" onClick={() => setFormStep(1)}>
                                    {lang === 'fr' ? 'Précédent' : 'Back'}
                                </button>
                            )}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : (formStep === 1 ? (lang === 'fr' ? 'Suivant' : 'Next') : t.submit_btn)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
