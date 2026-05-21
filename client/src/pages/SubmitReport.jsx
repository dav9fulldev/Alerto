import React, { useState, useEffect } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, Video, X, Check, Loader2, 
  ChevronRight, AlertTriangle, Zap, HeartPulse,
  Droplets, Flame, ShieldAlert, Bomb, PlusCircle,
  Construction, Building2, Store, Landmark, Factory, Users, Navigation, 
  Search, ShieldCheck, Activity, ChevronLeft, Clock, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { useTranslation } from '../services/i18n';
import { saveReportOffline } from '../services/storage';

/** Listes canoniques (FR) — alignées sur le backend `report_preview_ai.py` et i18n fr */
const CRISIS_TYPES_FR = [
    'Tremblement de terre', 'Inondation', 'Tsunami', 'Ouragan / Cyclone', 'Feu de forêt',
    'Explosion', 'Incident chimique', 'Conflit', 'Troubles civils'
];
const INFRA_TYPES_FR = [
    'Résidentiel', 'Commercial', 'Gouvernemental', 'Services Publics', 'Transport',
    'Communautaire', 'Espaces Publics', 'Autre'
];

function mapFrenchToLocale(frValue, frList, localeList) {
    const i = frList.indexOf(frValue);
    if (i >= 0 && localeList && localeList[i] !== undefined) return localeList[i];
    return frValue;
}

/** Analyse visuelle légère (canvas) — complément si l’API n’est pas disponible */
function analyzeImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const maxSide = 320;
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                const scale = Math.min(1, maxSide / Math.max(w, h, 1));
                w = Math.max(1, Math.floor(w * scale));
                h = Math.max(1, Math.floor(h * scale));
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas'));
                    return;
                }
                ctx.drawImage(img, 0, 0, w, h);
                const imageData = ctx.getImageData(0, 0, w, h);
                const d = imageData.data;
                let lumSum = 0;
                let satSum = 0;
                let count = 0;
                for (let i = 0; i < d.length; i += 16) {
                    const r = d[i];
                    const g = d[i + 1];
                    const b = d[i + 2];
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    lumSum += lum;
                    const mx = Math.max(r, g, b);
                    const mn = Math.min(r, g, b);
                    const sat = mx === 0 ? 0 : (mx - mn) / mx;
                    satSum += sat;
                    count++;
                }
                const avgLum = lumSum / count;
                const avgSat = satSum / count;

                let suggestedDamage = 'partiel';
                if (avgLum < 72) suggestedDamage = 'complet';
                else if (avgLum > 178 && avgSat < 0.38) suggestedDamage = 'minime';

                const confidence = Math.min(
                    0.93,
                    0.64 + avgSat * 0.22 + (1 - Math.min(Math.abs(avgLum - 128) / 128, 1)) * 0.12
                );

                const bullets = [];
                bullets.push(
                    avgLum < 95
                        ? 'Scène plutôt sombre ou peu contrastée (incident nocturne, intérieur, orage, etc.).'
                        : avgLum > 185
                          ? 'Scène très claire (plein jour, fort éclairage).'
                          : 'Luminosité globale modérée.'
                );
                bullets.push(
                    avgSat > 0.42
                        ? 'Couleurs marquées détectées (uniformes, bâches, végétation dense, etc.).'
                        : 'Palette plutôt neutre ou désaturée.'
                );
                bullets.push(
                    'Suggestion automatique du niveau de dégâts — à confirmer avec votre description terrain.'
                );

                resolve({
                    suggestedDamage,
                    confidence,
                    bullets,
                    avgLum,
                    avgSat
                });
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error('Image load'));
        img.src = dataUrl;
    });
}

function fallbackAiResult() {
    return {
        suggestedDamage: 'partiel',
        confidence: 0.72,
        bullets: [
            'Analyse détaillée indisponible pour ce média.',
            'Suggestion par défaut : dégâts partiels — précisez dans la description.'
        ]
    };
}

const SubmitReport = ({ lang, onClose }) => {
    const { t } = useTranslation();
    const [formStep, setFormStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiProgress, setAiProgress] = useState(0);
    const [aiResult, setAiResult] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successId, setSuccessId] = useState('');
    /** @type {'loading'|'ok'|'error'} */
    const [geoStatus, setGeoStatus] = useState('loading');
    const [geoHint, setGeoHint] = useState('');
    const [manualQuery, setManualQuery] = useState('');
    const [manualCoords, setManualCoords] = useState('');
    const [manualResolving, setManualResolving] = useState(false);
    const [previewWarning, setPreviewWarning] = useState('');

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'partiel', 
        infrastructure_type: 'Résidentiel',
        crisis_type: 'Inondation',
        text_location: 'Recherche de localisation...',
        electricity_status: 'Partiellement disponible',
        health_services_status: 'Non fonctionnels',
        urgent_needs: []
    });

    const handleBack = () => {
        if (formStep > 1) {
            setFormStep(formStep - 1);
        } else {
            onClose();
        }
    };

    useEffect(() => {
        getGPS();
    }, []);

    useEffect(() => {
        const crisisOpts = t?.options?.crisis;
        const infraOpts = t?.options?.infra;
        if (!crisisOpts?.length || !infraOpts?.length) return;
        setFormData(fd => {
            let next = { ...fd };
            if (!crisisOpts.includes(fd.crisis_type)) {
                const idx = CRISIS_TYPES_FR.indexOf(fd.crisis_type);
                next.crisis_type = idx >= 0 && crisisOpts[idx] ? crisisOpts[idx] : crisisOpts[0];
            }
            if (!infraOpts.includes(fd.infrastructure_type)) {
                const idx = INFRA_TYPES_FR.indexOf(fd.infrastructure_type);
                next.infrastructure_type = idx >= 0 && infraOpts[idx] ? infraOpts[idx] : infraOpts[0];
            }
            return next;
        });
    }, [lang, t?.options?.crisis, t?.options?.infra]);

    const isInsecureHttpOrigin = () =>
        window.location.protocol === 'http:' &&
        !/^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname);

    const getGPS = () => {
        setGeoStatus('loading');
        setGeoHint('');
        if (!('geolocation' in navigator)) {
            setGeoStatus('error');
            setGeoHint('La géolocalisation n’est pas disponible dans ce navigateur. Utilisez la saisie manuelle ci-dessous.');
            setFormData(prev => ({ ...prev, text_location: 'Position : saisie manuelle requise' }));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await updateLocation(position.coords.latitude, position.coords.longitude);
                setGeoStatus('ok');
                setGeoHint('');
            },
            (error) => {
                console.error('GPS Error', error);
                setGeoStatus('error');
                const insecure = isInsecureHttpOrigin();
                const secureMsg = error?.message?.includes?.('secure') || insecure;
                if (secureMsg) {
                    setGeoHint(
                        'En HTTP sur une adresse IP (ex. 192.168.x.x), le navigateur bloque le GPS. Ouvrez l’app via http://localhost:5173 sur ce PC, ou en HTTPS, ou renseignez une adresse / des coordonnées ci-dessous.'
                    );
                    setFormData(prev => ({ ...prev, text_location: 'Position : saisie manuelle (HTTP non sécurisé)' }));
                } else if (error.code === 1) {
                    setGeoHint('Accès au GPS refusé. Autorisez la localisation dans la barre d’adresse ou saisissez la position manuellement.');
                    setFormData(prev => ({ ...prev, text_location: 'Localisation manuelle requise' }));
                } else if (error.code === 2) {
                    setGeoHint('Position indisponible. Réessayez ou saisissez une adresse.');
                    setFormData(prev => ({ ...prev, text_location: 'Localisation manuelle requise' }));
                } else {
                    setGeoHint('GPS indisponible. Saisissez une adresse ou des coordonnées (lat, lng).');
                    setFormData(prev => ({ ...prev, text_location: 'Localisation manuelle requise' }));
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const updateLocation = async (lat, lng) => {
        setLocation({ lat, lng });
        setGeoStatus('ok');
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.data && res.data.display_name) {
                setFormData(prev => ({ ...prev, text_location: res.data.display_name }));
            }
        } catch (e) { 
            console.error(e);
            setFormData(prev => ({ ...prev, text_location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        }
    };

    const searchAddress = async () => {
        const q = manualQuery.trim();
        if (!q) return;
        setManualResolving(true);
        setErrorMessage('');
        try {
            const res = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: { format: 'json', q, limit: 1 },
                headers: { 'Accept-Language': lang === 'en' ? 'en' : 'fr' }
            });
            const hit = res.data?.[0];
            if (hit) {
                await updateLocation(parseFloat(hit.lat), parseFloat(hit.lon));
                setGeoHint('');
            } else {
                setErrorMessage('Adresse introuvable. Essayez une ville plus précise ou des coordonnées.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage('Géocodage impossible (réseau ou blocage). Utilisez le format latitude, longitude.');
        } finally {
            setManualResolving(false);
        }
    };

    const applyManualCoords = async () => {
        const raw = manualCoords.trim();
        const m = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (!m) {
            setErrorMessage('Format : latitude, longitude (ex. 5.3600, -4.0083)');
            return;
        }
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setErrorMessage('Coordonnées invalides.');
            return;
        }
        setErrorMessage('');
        await updateLocation(lat, lng);
        setGeoHint('');
    };

    const goToStep2 = () => {
        if (!location) {
            setErrorMessage(t?.submit?.location_required || 'Indiquez d’abord une position (GPS ou saisie manuelle ci-dessus).');
            return;
        }
        setErrorMessage('');
        setFormStep(2);
    };

    const needsOptions = ['Eau potable', 'Nourriture', 'Abris', 'Médicaments', 'Vêtements', 'Électricité', 'Autre', 'Déblaiement des routes'];

    const handleMediaCapture = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? 'video/*' : 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                setMediaType(type);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const url = reader.result;
                    setMediaPreview(url);
                    startAiAnalysis(url, type, file);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const startAiAnalysis = (mediaDataUrl, type, file) => {
        setAiAnalyzing(true);
        setAiProgress(0);
        setAiResult(null);
        setPreviewWarning('');
        const interval = setInterval(() => {
            setAiProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    (async () => {
                        try {
                            const crisisOpts = t?.options?.crisis || CRISIS_TYPES_FR;
                            const infraOpts = t?.options?.infra || INFRA_TYPES_FR;

                            if (type === 'video') {
                                const result = {
                                    ...fallbackAiResult(),
                                    isCrisisRelated: true,
                                    serverSource: null,
                                    bullets: [
                                        'Pour les vidéos, l’analyse IA image n’est pas encore activée dans cette version.',
                                        'Indiquez le type de crise, les dégâts et les détails dans le formulaire.'
                                    ]
                                };
                                setAiResult(result);
                                setFormData(fd => ({
                                    ...fd,
                                    damage_level: result.suggestedDamage
                                }));
                                setAiAnalyzing(false);
                                return;
                            }

                            let serverPreview = null;
                            if (file && navigator.onLine) {
                                try {
                                    const fd = new FormData();
                                    fd.append('file', file);
                                    const res = await axios.post(`${API_BASE}/reports/analyze-preview`, fd, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    serverPreview = res.data;
                                } catch (err) {
                                    console.warn('analyze-preview indisponible, analyse locale seulement', err);
                                }
                            }

                            const localResult = await analyzeImageFromDataUrl(mediaDataUrl);

                            const apiBlocked = serverPreview?.api_error === 'openai_quota_exceeded'
                                || serverPreview?.api_error === 'openai_auth_error'
                                || serverPreview?.api_error === 'openai_unavailable';

                            if (apiBlocked) {
                                const warnMsg = serverPreview.api_error === 'openai_quota_exceeded'
                                    ? (t?.submit?.openai_quota || serverPreview.analysis_summary)
                                    : (serverPreview.analysis_summary || t?.submit?.openai_quota);
                                setPreviewWarning(warnMsg);
                                setAiResult({
                                    ...localResult,
                                    isCrisisRelated: true,
                                    serverSource: null,
                                    bullets: [serverPreview.analysis_summary, ...(localResult.bullets || []).slice(0, 1)].filter(Boolean)
                                });
                                setFormData(fd => ({
                                    ...fd,
                                    damage_level: localResult.suggestedDamage
                                }));
                            } else if (serverPreview && typeof serverPreview.damage_level === 'string' && serverPreview.source === 'openai') {
                                const bullets = [
                                    serverPreview.analysis_summary,
                                    ...(localResult.bullets || []).slice(0, 2)
                                ].filter(Boolean);

                                setAiResult({
                                    suggestedDamage: serverPreview.damage_level,
                                    confidence: typeof serverPreview.relevance_score === 'number'
                                        ? serverPreview.relevance_score
                                        : localResult.confidence,
                                    bullets,
                                    avgLum: localResult.avgLum,
                                    avgSat: localResult.avgSat,
                                    isCrisisRelated: serverPreview.is_crisis_related !== false,
                                    serverSource: 'openai'
                                });

                                setFormData(fd => {
                                    const crisisLabel = mapFrenchToLocale(
                                        serverPreview.crisis_type_fr || 'Inondation',
                                        CRISIS_TYPES_FR,
                                        crisisOpts
                                    );
                                    const infraLabel = mapFrenchToLocale(
                                        serverPreview.infrastructure_type_fr || 'Résidentiel',
                                        INFRA_TYPES_FR,
                                        infraOpts
                                    );
                                    const draft = (serverPreview.description_draft || '').trim();
                                    const needsFr = Array.isArray(serverPreview.urgent_needs_fr)
                                        ? serverPreview.urgent_needs_fr
                                        : [];

                                    return {
                                        ...fd,
                                        damage_level: serverPreview.damage_level,
                                        crisis_type: crisisLabel,
                                        infrastructure_type: infraLabel,
                                        description: draft && !fd.description.trim() ? draft : fd.description,
                                        urgent_needs: needsFr.length ? needsFr : fd.urgent_needs
                                    };
                                });

                                if (serverPreview.is_crisis_related === false) {
                                    setPreviewWarning(
                                        t?.submit?.photo_not_crisis
                                        || 'La photo ne semble pas montrer un sinistre ou un contexte de crise. Reprenez une image des dégâts ou complétez manuellement les champs.'
                                    );
                                }
                            } else if (serverPreview && typeof serverPreview.damage_level === 'string') {
                                setAiResult({
                                    suggestedDamage: serverPreview.damage_level,
                                    confidence: typeof serverPreview.relevance_score === 'number'
                                        ? serverPreview.relevance_score
                                        : localResult.confidence,
                                    bullets: [serverPreview.analysis_summary, ...(localResult.bullets || [])].filter(Boolean),
                                    isCrisisRelated: serverPreview.is_crisis_related !== false,
                                    serverSource: null
                                });
                                setFormData(fd => ({ ...fd, damage_level: serverPreview.damage_level }));
                            } else {
                                setAiResult({
                                    ...localResult,
                                    isCrisisRelated: true,
                                    serverSource: null
                                });
                                setFormData(fd => ({
                                    ...fd,
                                    damage_level: localResult.suggestedDamage
                                }));
                            }
                        } catch (e) {
                            console.error('AI preview analysis failed', e);
                            const fb = fallbackAiResult();
                            setAiResult({ ...fb, isCrisisRelated: true, serverSource: null });
                            setFormData(fd => ({ ...fd, damage_level: fb.suggestedDamage }));
                        } finally {
                            setAiAnalyzing(false);
                        }
                    })();
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const toggleNeed = (need) => {
        setFormData(prev => ({
            ...prev,
            urgent_needs: prev.urgent_needs.includes(need) 
                ? prev.urgent_needs.filter(n => n !== need)
                : [...prev.urgent_needs, need]
        }));
    };

    const handleSubmit = async () => {
        if (!selectedFile || !location || !formData.description.trim()) {
            setErrorMessage(t?.submit?.required_fields || 'Veuillez ajouter un média, une description et activer la localisation.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        const healthMap = {
            [t?.submit?.health_none || 'Non fonctionnels']: 0,
            [t?.submit?.health_part || 'Partiellement fonctionnels']: 50,
            [t?.submit?.health_full || 'Fonctionnels']: 100
        };

        const electricityMap = {
            [t?.submit?.elec_none || 'Totalement indisponible']: 0,
            [t?.submit?.elec_part || 'Partiellement disponible']: 50,
            [t?.submit?.elec_stable || 'Stable']: 100
        };

        const payload = {
            description: formData.description.trim(),
            damage_level: formData.damage_level,
            infrastructure_type: formData.infrastructure_type,
            crisis_type: formData.crisis_type,
            text_location: formData.text_location,
            electricity_status: electricityMap[formData.electricity_status] ?? 50,
            health_services_status: healthMap[formData.health_services_status] ?? 50,
            urgent_needs: formData.urgent_needs,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat]
            },
            user_id: localStorage.getItem('alerto_user_id') || null,
            source: navigator.onLine ? 'online' : 'offline',
            created_at: new Date().toISOString()
        };

        try {
            let uploadedUrl = null;
            const uploadData = new FormData();
            uploadData.append('file', selectedFile);
            const uploadRes = await axios.post(`${API_BASE}/reports/upload`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            uploadedUrl = uploadRes?.data?.url || null;
            payload.image_url = uploadedUrl;

            if (navigator.onLine) {
                const res = await axios.post(`${API_BASE}/reports/`, payload);
                const reportId = res?.data?.id || `ALR-${Date.now()}`;
                setSuccessId(reportId);
                saveToLocalHistory({
                    id: reportId,
                    status: 'sent',
                    image_url: uploadedUrl,
                    description: payload.description,
                    damage_level: payload.damage_level,
                    infrastructure_type: payload.infrastructure_type,
                    crisis: payload.crisis_type,
                    location: payload.text_location || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                    created_at: payload.created_at
                });
            } else {
                await saveReportOffline(payload);
                const offlineId = `OFF-${Date.now()}`;
                setSuccessId(offlineId);
                saveToLocalHistory({
                    id: offlineId,
                    status: 'pending',
                    image_url: mediaPreview,
                    description: payload.description,
                    damage_level: payload.damage_level,
                    infrastructure_type: payload.infrastructure_type,
                    crisis: payload.crisis_type,
                    location: payload.text_location || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                    created_at: payload.created_at
                });
            }

            setIsSuccess(true);
        } catch (error) {
            const canFallbackOffline = !error?.response || (error?.response?.status >= 500 && error?.response?.status < 600);
            if (!navigator.onLine || canFallbackOffline) {
                try {
                    await saveReportOffline(payload);
                    const offlineId = `OFF-${Date.now()}`;
                    setSuccessId(offlineId);
                    saveToLocalHistory({
                        id: offlineId,
                        status: 'pending',
                        image_url: mediaPreview,
                        description: payload.description,
                        damage_level: payload.damage_level,
                        infrastructure_type: payload.infrastructure_type,
                        crisis: payload.crisis_type,
                        location: payload.text_location || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                        created_at: payload.created_at
                    });
                    setIsSuccess(true);
                } catch {
                    setErrorMessage(t?.submit?.offline_save_error || "Impossible d'enregistrer le signalement hors ligne.");
                }
            } else {
                setErrorMessage(error?.response?.data?.detail || t?.submit?.submit_error || "Échec de l'envoi du signalement.");
            }
        } finally {
            setLoading(false);
        }
    };

    const saveToLocalHistory = (entry) => {
        const existing = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
        localStorage.setItem('alerto_my_reports', JSON.stringify([entry, ...existing]));
    };

    if (isSuccess) {
        return (
            <div className="success-overlay-premium">
                <div className="success-card-premium">
                    <div className="confetti-bg"></div>
                    <div className="success-icon-circle-large">
                        <Check size={48} color="white" strokeWidth={4} />
                    </div>
                    <h2>{t?.submit?.success_title || "Signalement envoyé !"}</h2>
                    <p className="success-sub-text">{t?.submit?.success_msg || "Merci pour votre contribution. Votre signalement a été transmis avec succès."}</p>
                    <div className="success-id-container">ID : #{successId || 'ALR-PENDING'}</div>
                    <button className="btn-success-final" onClick={() => { setIsSuccess(false); setFormStep(1); setMediaPreview(null); setSelectedFile(null); setAiResult(null); setAiProgress(0); setPreviewWarning(''); setFormData(prev => ({ ...prev, description: '', urgent_needs: [] })); }}>OK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="submit-report-premium">
            <header className="report-header-premium">
                <button className="header-back-btn" onClick={handleBack}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-center-info">
                    <div className="step-count-label">{t?.submit?.step || "Étape"} {formStep}/2</div>
                    <div className="gradient-progress-container">
                        <div className="gradient-progress-fill" style={{ width: `${formStep === 1 ? '50%' : '100%'}` }}></div>
                    </div>
                </div>
                <button className="header-clock-btn"><Clock size={20} /></button>
            </header>

            <div className="report-content-scroll">
                {formStep === 1 && !mediaPreview && (
                    <div className="media-step-premium">
                        <h1 className="step-title-premium">{t?.submit?.take_photo || "Prenez une photo ou vidéo"}</h1>
                        <div className="media-grid-premium">
                            <div className="media-option photo" onClick={() => handleMediaCapture('image')}>
                                <div className="option-icon-box"><Camera size={32} /></div>
                                <span>{t?.submit?.photo || "PHOTO"}</span>
                            </div>
                            <div className="media-option video" onClick={() => handleMediaCapture('video')}>
                                <div className="option-icon-box"><Video size={32} /></div>
                                <span>{t?.submit?.video || "VIDÉO"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {formStep === 1 && mediaPreview && (
                    <div className="form-step-premium">
                        <div className="preview-card-premium">
                            {mediaType === 'video' ? (
                                <video className="preview-media-fit" src={mediaPreview} muted playsInline controls={false} />
                            ) : (
                                <img className="preview-media-fit" src={mediaPreview} alt="Capture" />
                            )}
                            <button
                                type="button"
                                className="close-preview-btn"
                                onClick={() => {
                                    setMediaPreview(null);
                                    setAiResult(null);
                                    setAiProgress(0);
                                    setPreviewWarning('');
                                }}
                            ><X size={16} /></button>
                        </div>
                        
                        {aiAnalyzing ? (
                            <div className="ai-analysis-card-premium">
                                <div className="ai-status-row">
                                    <Activity size={18} />
                                    <span>{t?.submit?.ai_analyzing || "Analyse IA en cours..."}</span>
                                </div>
                                <p className="ai-sub-status">{t?.submit?.ai_sub || "Détection d'éléments et pré-classification"}</p>
                                <div className="ai-progress-track">
                                    <div className="ai-progress-bar-fill" style={{ width: `${aiProgress}%` }}></div>
                                </div>
                                <div className="ai-percentage-text">{aiProgress}%</div>
                            </div>
                        ) : (
                            <>
                                {previewWarning && (
                                    <div className="preview-warning-banner" role="alert">
                                        <AlertTriangle size={18} />
                                        <span>{previewWarning}</span>
                                        <button type="button" className="preview-warning-dismiss" onClick={() => setPreviewWarning('')} aria-label="Fermer">×</button>
                                    </div>
                                )}
                                {aiResult && (
                                    <div className="ai-result-card-premium">
                                        <div className="ai-result-header-row">
                                            <Sparkles size={20} className="ai-result-icon" />
                                            <span>{t?.submit?.ai_result_title || 'Résultat de l’analyse IA'}</span>
                                        </div>
                                        <div className="ai-result-metrics">
                                            <div className="ai-result-metric">
                                                <span className="ai-result-metric-label">{t?.submit?.ai_confidence || 'Confiance'}</span>
                                                <strong>{Math.round((aiResult.confidence || 0) * 100)}%</strong>
                                            </div>
                                            <div className="ai-result-metric ai-result-metric-highlight">
                                                <span className="ai-result-metric-label">{t?.submit?.ai_suggested_level || 'Niveau suggéré'}</span>
                                                <strong>
                                                    {aiResult.suggestedDamage === 'minime' && (t?.options?.damage?.minime || 'Minime')}
                                                    {aiResult.suggestedDamage === 'partiel' && (t?.options?.damage?.partiel || 'Partiel')}
                                                    {aiResult.suggestedDamage === 'complet' && (t?.options?.damage?.complet || 'Complet')}
                                                </strong>
                                            </div>
                                        </div>
                                        <p className="ai-result-intro">{t?.submit?.ai_result_intro || 'Éléments pris en compte pour cette pré-classification :'}</p>
                                        <ul className="ai-result-bullets">
                                            {(aiResult.bullets || []).map((line, idx) => (
                                                <li key={idx}>{line}</li>
                                            ))}
                                        </ul>
                                        <p className="ai-result-disclaimer">
                                            {t?.submit?.ai_disclaimer || 'Indicatif (TRL démo). Vérifiez toujours avec votre observation et votre description.'}
                                        </p>
                                        {aiResult.serverSource && (
                                            <p className="ai-prefill-hint">{t?.submit?.ai_prefill_hint}</p>
                                        )}
                                    </div>
                                )}
                                <div className="fields-stack-premium">
                                <h1 className="step-title-premium">{t?.submit?.describe || "Décrivez la situation"}</h1>
                                <div className="field-group-premium">
                                    <label>{t?.submit?.description_label || "Description du sinistre *"} </label>
                                    <textarea 
                                        placeholder={t?.submit?.description_placeholder || "Inondation importante..."}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                    <div className="char-indicator">{formData.description.length}/500</div>
                                </div>

                                <div className="field-group-premium">
                                    <label>{t?.submit?.damage_label || "Niveau de dégâts *"}</label>
                                    <div className="damage-grid-premium">
                                        <div className={`damage-box minime ${formData.damage_level === 'minime' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'minime'})}>
                                            <ShieldCheck size={20} /> <span>{t?.options?.damage?.minime || "Minime"}</span>
                                        </div>
                                        <div className={`damage-box partiel ${formData.damage_level === 'partiel' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'partiel'})}>
                                            <AlertTriangle size={20} /> <span>{t?.options?.damage?.partiel || "Partiel"}</span>
                                        </div>
                                        <div className={`damage-box complet ${formData.damage_level === 'complet' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'complet'})}>
                                            <Flame size={20} /> <span>{t?.options?.damage?.complet || "Complet"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="field-group-premium">
                                    <label>{t?.submit?.infra_label || "Type d'infrastructure *"}</label>
                                    <select value={formData.infrastructure_type} onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}>
                                        {(t?.options?.infra || []).map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="field-group-premium">
                                    <label>{t?.submit?.crisis_label || 'Nature de la crise *'}</label>
                                    <select value={formData.crisis_type} onChange={(e) => setFormData({...formData, crisis_type: e.target.value})}>
                                        {(t?.options?.crisis || CRISIS_TYPES_FR).map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="field-group-premium">
                                    <label className="label-with-badge">
                                        {t?.submit?.location_label || "Localisation"} 
                                        <span className={
                                            geoStatus === 'ok'
                                                ? 'gps-pill-green'
                                                : geoStatus === 'loading'
                                                    ? 'gps-pill-loading'
                                                    : 'gps-pill-warn'
                                        }>
                                            {geoStatus === 'loading' && (
                                                <>
                                                    <Loader2 size={12} className="spin-mini" /> Recherche GPS…
                                                </>
                                            )}
                                            {geoStatus === 'ok' && (
                                                <>
                                                    <div className="dot-blink"></div> {t?.submit?.gps_active || 'GPS actif'}
                                                </>
                                            )}
                                            {geoStatus === 'error' && (
                                                <>⚠ Position manuelle</>
                                            )}
                                        </span>
                                    </label>
                                    <div className="location-box-premium">
                                        <div className="location-text-wrap">
                                            {formData.text_location}
                                        </div>
                                        <button type="button" className="edit-loc-btn" title="Réessayer le GPS" onClick={getGPS}><Navigation size={18} /></button>
                                    </div>
                                    {geoHint && (
                                        <p className="geo-hint-text">{geoHint}</p>
                                    )}
                                    <div className="manual-location-stack">
                                        <label className="manual-loc-label">Adresse ou lieu (recherche)</label>
                                        <div className="manual-loc-row">
                                            <input
                                                className="manual-loc-input"
                                                type="text"
                                                placeholder="Ex. Cocody, Abidjan"
                                                value={manualQuery}
                                                onChange={(e) => setManualQuery(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="btn-manual-search"
                                                disabled={manualResolving || !manualQuery.trim()}
                                                onClick={searchAddress}
                                            >
                                                {manualResolving ? <Loader2 className="spinner-sm" /> : <Search size={18} />}
                                            </button>
                                        </div>
                                        <label className="manual-loc-label">Ou coordonnées</label>
                                        <div className="manual-loc-row">
                                            <input
                                                className="manual-loc-input"
                                                type="text"
                                                placeholder="latitude, longitude"
                                                value={manualCoords}
                                                onChange={(e) => setManualCoords(e.target.value)}
                                            />
                                            <button type="button" className="btn-manual-search" onClick={applyManualCoords}>
                                                OK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                )}

                {formStep === 2 && (
                    <div className="additional-step-premium">
                        <h1 className="step-title-premium">{t?.submit?.extra_info || "Informations complémentaires"}</h1>
                        
                        <div className="field-group-premium">
                            <label>{t?.submit?.electricity || "Électricité"}</label>
                            <select value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: e.target.value})}>
                                <option>{t?.submit?.elec_part || "Partiellement disponible"}</option>
                                <option>{t?.submit?.elec_none || "Totalement indisponible"}</option>
                                <option>{t?.submit?.elec_stable || "Stable"}</option>
                            </select>
                        </div>

                        <div className="field-group-premium">
                            <label>{t?.submit?.health || "Services de santé"}</label>
                            <select value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: e.target.value})}>
                                <option>{t?.submit?.health_none || "Non fonctionnels"}</option>
                                <option>{t?.submit?.health_part || "Partiellement fonctionnels"}</option>
                                <option>{t?.submit?.health_full || "Fonctionnels"}</option>
                            </select>
                        </div>

                        <div className="field-group-premium">
                            <label>{t?.submit?.needs_label || "Besoins les plus urgents"}</label>
                            <div className="needs-tag-grid-premium">
                                {needsOptions.map(need => (
                                    <div 
                                        key={need} 
                                        className={`need-tag-premium ${formData.urgent_needs.includes(need) ? 'active' : ''}`}
                                        onClick={() => toggleNeed(need)}
                                    >
                                        {need}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="report-footer-premium">
                {errorMessage && (
                    <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
                        {errorMessage}
                    </div>
                )}
                <div className="footer-actions-row">
                    <button className="btn-cancel-premium" onClick={handleBack}>{t?.submit?.btn_back || "Annuler"}</button>
                    {formStep === 1 ? (
                        <button
                            className="btn-next-premium"
                            disabled={!mediaPreview || aiAnalyzing || !location || geoStatus === 'loading'}
                            onClick={goToStep2}
                        >
                            {t?.submit?.btn_next || "Suivant"} <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button className="btn-submit-premium" disabled={loading} onClick={handleSubmit}>
                            {loading ? <Loader2 className="spinner" /> : (
                                <>
                                    <span>{t?.submit?.btn_submit || "Envoyer le signalement"}</span>
                                    <Navigation size={20} style={{ transform: 'rotate(90deg)' }} />
                                </>
                            )}
                        </button>
                    )}
                </div>
                <div className="footer-status-row">
                    <div className="status-dot-green"></div>
                    <span>{t?.home?.status?.online || "En ligne"} — {t?.submit?.ready || "Prêt à envoyer"}</span>
                </div>
            </footer>
        </div>
    );
};

export default SubmitReport;
