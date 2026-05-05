import React, { useState, useEffect, useRef } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, Video, X, Check, Info, Phone, Mail, Loader2, 
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
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const deferredPrompt = useRef(null);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime', 
        infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
        infrastructure_name: '',
        crisis_type: (t.options && t.options.crisis) ? t.options.crisis[1] : 'Inondation',
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

    // Dynamic crisis options with translated labels
    const getCrisisOptions = () => {
        const icons = {
            'Séisme': <Home size={24} />,
            'Inondation': <Droplets size={24} />,
            'Cyclone': <Users size={24} />, // Approximation
            'Tsunami': <Droplets size={24} />,
            'Incendie de forêt': <Flame size={24} />,
            'Explosion': <Bomb size={24} />,
            'Incident chimique': <ShieldAlert size={24} />,
            'Conflit': <ShieldAlert size={24} />,
            'Troubles civils': <Users size={24} />,
            'Autre': <PlusCircle size={24} />,
            'Earthquake': <Home size={24} />,
            'Flood': <Droplets size={24} />,
            'Wildfire': <Flame size={24} />,
            'Conflict': <ShieldAlert size={24} />,
            'Civil Unrest': <Users size={24} />
        };

        // If translations exist, use them
        if (t.options && t.options.crisis) {
            return t.options.crisis.map((label, index) => ({
                id: label, // We use the translated label as ID for simplicity in this version
                icon: icons[label] || <PlusCircle size={24} />,
                label: label
            }));
        }

        return [];
    };

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
        if (outcome === 'accepted') setShowInstallPrompt(false);
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

    const handleMediaCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            setMediaType(type);
            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            let mediaUrl = "";
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadData);
                mediaUrl = res.data.url;
            }

            const payload = {
                ...formData,
                image_url: mediaUrl,
                media_type: mediaType,
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
            alert("Erreur réseau. Signalement mis en attente.");
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
            crisis_type: (t.options && t.options.crisis) ? t.options.crisis[0] : 'Inondation',
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
        setMediaPreview(null);
        setSelectedFile(null);
        setMediaType(null);
        setFormStep(1);
    };

    return (
        <div className="report-container">
            {showInstallPrompt && (
                <div className="install-banner">
                    <span>Installer ALERTO (Direct Access)</span>
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
                                    {getCrisisOptions().map(opt => (
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
                                        {t.options?.infra?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <label className="input-label">Capture Temps Réel (Photo/Vidéo)</label>
                                <div className="photo-box" onClick={() => document.getElementById('media-input').click()}>
                                    {mediaPreview ? (
                                        mediaType === 'video' ? (
                                            <video src={mediaPreview} className="preview-media" controls />
                                        ) : (
                                            <img src={mediaPreview} alt="Preview" className="preview-media" />
                                        )
                                    ) : (
                                        <div className="capture-placeholder">
                                            <div className="icon-row">
                                                <Camera size={32} />
                                                <Video size={32} />
                                            </div>
                                            <span>Cliquer pour capturer en direct</span>
                                        </div>
                                    )}
                                    <input id="media-input" type="file" accept="image/*,video/*" capture="environment" hidden onChange={handleMediaCapture} />
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
                                <h2 className="form-section-title">Analyse Tactique (PNUD)</h2>
                                <div className="slider-group">
                                    <label className="input-label"><Zap size={14}/> {t.electricity}</label>
                                    <input type="range" min="0" max="100" value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>0% (Coupé)</span><span>100% (Stable)</span></div>
                                </div>

                                <div className="slider-group">
                                    <label className="input-label"><HeartPulse size={14}/> {t.health}</label>
                                    <input type="range" min="0" max="100" value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: parseInt(e.target.value)})} />
                                    <div className="slider-labels"><span>Indisponible</span><span>Opérationnel</span></div>
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
                                        <input type="tel" className="input-modern-clean" placeholder="Numéro Urgence" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                                    </div>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={formData.allow_contact} onChange={(e) => setFormData({...formData, allow_contact: e.target.checked})} />
                                        Autoriser le contact (ONU/PNUD)
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
                                {loading ? <Loader2 className="spinner" /> : (formStep === 1 ? 'Suivant' : t.submit_btn)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
