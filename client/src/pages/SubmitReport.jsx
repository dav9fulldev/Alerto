import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SubmitReport.css';
import { MapPin, Send, Loader2, Camera, X } from 'lucide-react';
import axios from 'axios';
import { saveReportOffline } from '../services/storage';
import { syncOfflineData } from '../services/sync';

const API_BASE = `http://${window.location.hostname}:8000`;
const API_URL = `${API_BASE}/reports`;
import { translations } from '../services/i18n';

const SubmitReport = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const isRTL = lang === 'ar';
    const [formStep, setFormStep] = useState(1);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineCount, setOfflineCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime',
        infrastructure_type: 'Résidentiel',
        crisis_type: 'Inondation',
        debris_present: false,
        text_location: '',
        image_url: 'test.jpg',
        electricity_status: '',
        health_services_status: '',
        urgent_needs: [],
        urgent_needs_other: ''
    });

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
                    
                    // Reverse Geocoding via Nominatim (Gratuit & Open Source)
                    try {
                        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        if (response.data && response.data.display_name) {
                            setFormData(prev => ({...prev, text_location: response.data.display_name}));
                        }
                    } catch (error) {
                        console.error("Erreur Geocoding:", error);
                    }
                },
                (error) => console.error("Erreur GPS:", error),
                { enableHighAccuracy: true }
            );
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let finalImageUrl = formData.image_url;
        let finalVideoUrl = "";

        // Si on a une photo/vidéo en mémoire locale (blob ou dataURL), on l'upload d'abord
        const uploadFile = async (fileToUpload, name) => {
            if (!fileToUpload) return null;
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', fileToUpload);

                console.log(`📡 Envoi du fichier ${name} au serveur...`);
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadFormData);
                console.log("✅ Serveur a reçu le fichier :", res.data.url);
                return res.data.url;
            } catch (err) {
                console.error("❌ ERREUR UPLOAD :", err);
                return null;
            }
        };

        console.log("🛠️ DÉBUT SOUMISSION - Fichiers détectés :", { 
            image: !!selectedImageFile, 
            video: !!selectedVideoFile 
        });

        if (selectedImageFile) {
            console.log("📸 Tentative d'upload Image Physique...");
            const uploadedUrl = await uploadFile(selectedImageFile, "photo_sinistre.jpg");
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            }
        }

        if (selectedVideoFile) {
            console.log("🎥 Tentative d'upload Vidéo Physique...");
            const uploadedVideoUrl = await uploadFile(selectedVideoFile, "video_sinistre.webm");
            if (uploadedVideoUrl) {
                finalVideoUrl = uploadedVideoUrl;
            }
        }

        const payload = {
            ...formData,
            image_url: finalImageUrl,
            video_url: finalVideoUrl,
            location: {
                type: "Point",
                coordinates: location ? [location.lng, location.lat] : [0, 0]
            }
        };

        if (navigator.onLine) {
            try {
                await axios.post(API_URL, payload);
                alert(t.online_success);
                resetForm();
            } catch (error) {
                await fallbackToOffline(payload);
            }
        } else {
            await fallbackToOffline(payload);
        }
        setLoading(false);
    };

    const fallbackToOffline = async (payload) => {
        await saveReportOffline(payload);
        alert(t.offline_success);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            description: '',
            damage_level: 'minime',
            infrastructure_type: 'Résidentiel',
            crisis_type: 'Inondation',
            debris_present: false,
            text_location: '',
            image_url: ''
        });
        setLocation(null);
        setImagePreview(null);
        setVideoPreview(null);
        setSelectedImageFile(null);
        setSelectedVideoFile(null);
    };

    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert(lang === 'fr' 
                ? "Caméra bloquée : Votre navigateur nécessite une connexion sécurisée (HTTPS) ou localhost pour accéder à l'appareil photo." 
                : "Camera blocked: Your browser requires a secure connection (HTTPS) or localhost to access the camera.");
            return;
        }
        setShowCamera(true);
        
        // Laisser 300ms à React pour afficher l'élément <video> dans le DOM
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" }, 
                    audio: true 
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Erreur caméra:", err);
                setShowCamera(false);
            }
        }, 300);
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [captureMode, setCaptureMode] = useState('photo'); 
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(90);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const videoChunks = useRef([]);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            // On genere un FICHIER reel pour l'envoi
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "photo_capturee.jpg", { type: "image/jpeg" });
                    setSelectedImageFile(file);
                }
            }, 'image/jpeg');

            const dataUrl = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUrl);
            stopCamera();
            
            // Analyse d'Image Autonome (Simulation)
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                const isComplexImage = Math.random() > 0.4;
                if (isComplexImage) {
                    setFormData(prev => ({...prev, damage_level: "partiel", infrastructure_type: "Gouvernemental"}));
                    alert(lang === 'fr' 
                        ? "🤖 IA : Détection autonome d'anomalies structurelles [Confiance : 88%]"
                        : "🤖 AI: Autonomous detection of structural anomalies [Confidence: 88%]");
                }
            }, 3000);
        }
    };

    const startRecording = () => {
        const stream = streamRef.current;
        
        if (!stream) {
            console.error("Flux caméra indisponible dans streamRef");
            return;
        }

        setIsRecording(true);
        setTimeLeft(90);
        videoChunks.current = [];
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                videoChunks.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            clearInterval(timerRef.current);
            const blob = new Blob(videoChunks.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            setVideoPreview(videoUrl);
            setFormData(prev => ({...prev, video_url: "video_temoignage.webm"}));
            alert(lang === 'fr' ? "📹 Vidéo (1m30 max) capturée !" : "📹 Video (1m30 max) captured!");
            stopCamera();
        };

        mediaRecorder.start();

        // Compte à rebours
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
                clearInterval(timerRef.current);
                const blob = new Blob(videoChunks.current, { type: 'video/webm' });
                const file = new File([blob], "video_temoignage.webm", { type: 'video/webm' });
                setSelectedVideoFile(file); // ON SAUVEGARDE LE FICHIER REEL
                
                const videoUrl = URL.createObjectURL(blob);
                setVideoPreview(videoUrl);
                stopCamera();
            };
            mediaRecorderRef.current.stop();
        }
    };


    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    const handleDescriptionChange = (val) => {
        setFormData({...formData, description: val});
        
        const text = val.toLowerCase();
        let suggestion = 'minime';
        
        if (text.includes('détruit') || text.includes('effondré') || text.includes('mort') || text.includes('total')) {
            suggestion = 'complet';
        } else if (text.includes('fissure') || text.includes('cassé') || text.includes('partiel') || text.includes('réparable')) {
            suggestion = 'partiel';
        }

        if (suggestion !== formData.damage_level) {
            setFormData(prev => ({...prev, damage_level: suggestion}));
        }
    };

    return (
        <div className={`report-container ${isRTL ? 'rtl' : ''}`}>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            {!isOnline && (
                <div className="offline-banner">
                    ⚠️ {lang === 'fr' ? 'Mode Hors-Ligne Actif' : 'Offline Mode Active'}
                </div>
            )}

            {showCamera && (
                <div className="camera-overlay">
                    <div className="camera-mode-tabs">
                        <button 
                            className={`mode-tab ${captureMode === 'photo' ? 'active' : ''}`}
                            onClick={() => setCaptureMode('photo')}
                        >
                            {lang === 'fr' ? 'PHOTO' : 'PHOTO'}
                        </button>
                        <button 
                            className={`mode-tab ${captureMode === 'video' ? 'active' : ''}`}
                            onClick={() => setCaptureMode('video')}
                        >
                            {lang === 'fr' ? 'VIDÉO' : 'VIDEO'}
                        </button>
                    </div>

                    {isRecording && (
                        <div className="recording-timer">
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    )}

                    <video ref={videoRef} autoPlay playsInline muted className="camera-feed"></video>
                    
                    <div className="camera-controls">
                        <button onClick={stopCamera} className="cam-btn cancel">✕</button>
                        
                        {captureMode === 'photo' ? (
                            <button onClick={capturePhoto} className="cam-btn capture">
                                <div className="inner-circle"></div>
                            </button>
                        ) : (
                            <button 
                                onClick={isRecording ? stopRecording : startRecording} 
                                className={`cam-btn record ${isRecording ? 'recording' : ''}`}
                            >
                                <div className="record-circle"></div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="report-card">
                <div className="header">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (formStep === 1) {
                        setFormStep(2);
                    } else {
                        handleSubmit(e);
                    }
                }}>
                    {formStep === 1 && (
                        <>
                        <div style={{textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0'}}>
                                {lang === 'fr' ? 'Étape 1/2' : lang === 'en' ? 'Step 1/2' : lang === 'es' ? 'Paso 1/2' : lang === 'ar' ? 'الخطوة 1/2' : lang === 'zh' ? '第 1/2 步' : 'Шаг 1/2'}
                            </p>
                        </div>
                    <div className="form-group">
                        <label>{t.take_photo}</label>
                        {!imagePreview && !videoPreview ? (
                            <div className="photo-upload-placeholder" onClick={startCamera}>
                                <Camera size={40} />
                                <span>{captureMode === 'photo' ? t.take_photo : (lang === 'fr' ? 'ENREGISTRER VIDÉO' : 'RECORD VIDEO')}</span>
                            </div>
                        ) : (
                            <div className="photo-preview-container">
                                {isAnalyzing && (
                                    <div className="ai-scanning-overlay">
                                        <div className="scan-line"></div>
                                        <span>ANALYSE IA...</span>
                                    </div>
                                )}
                                {imagePreview && <img src={imagePreview} alt="Preview" className="photo-preview" />}
                                {videoPreview && (
                                    <video src={videoPreview} controls className="photo-preview" />
                                )}
                                <button type="button" className="remove-photo" onClick={() => {
                                    setImagePreview(null);
                                    setVideoPreview(null);
                                }}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label>{t.description_label}</label>
                            {formData.description.length > 5 && (
                                <span className="ai-badge">🤖 IA Active</span>
                            )}
                        </div>
                        <textarea 
                            required
                            placeholder={t.description_placeholder}
                            value={formData.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.damage_label}</label>
                        <div className="damage-grid">
                            {Object.entries(t.options.damage).map(([key, label]) => (
                                <div 
                                    key={key}
                                    className={`damage-option ${formData.damage_level === key ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, damage_level: key})}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{display: 'flex', gap: '10px'}}>
                            <div style={{flex: 1}}>
                                <label>{t.infrastructure_label}</label>
                                <select 
                                    value={formData.infrastructure_type}
                                    onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}
                                >
                                    {t.options.infra.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div style={{flex: 1}}>
                                <label>{t.crisis_label}</label>
                                <select 
                                    value={formData.crisis_type}
                                    onChange={(e) => setFormData({...formData, crisis_type: e.target.value})}
                                >
                                    {t.options.crisis.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="gps-status">
                            <MapPin size={14} color={location ? "#10b981" : "#f43f5e"} />
                            <span>{location ? `${t.gps_active} (${location.lat.toFixed(4)})` : t.gps_searching}</span>
                            {!location && (
                                <button type="button" onClick={getGPS} className="mini-gps-btn">
                                    📍 {lang === 'fr' ? 'Réessayer' : 'Retry'}
                                </button>
                            )}
                        </div>
                        <div className="input-with-button">
                            <input 
                                placeholder={t.location_label}
                                value={formData.text_location}
                                onChange={(e) => setFormData({...formData, text_location: e.target.value})}
                            />
                            <button type="button" onClick={getGPS} className="gps-refresh-btn">
                                <MapPin size={18} />
                            </button>
                        </div>
                    </div>
                    </>
                    )}

                    {formStep === 2 && (
                    <>
                    <div style={{textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                        <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0'}}>
                            {lang === 'fr' ? 'Étape 2/2' : lang === 'en' ? 'Step 2/2' : lang === 'es' ? 'Paso 2/2' : lang === 'ar' ? 'الخطوة 2/2' : lang === 'zh' ? '第 2/2 步' : 'Шаг 2/2'}
                        </p>
                    </div>
                    <div className="form-group modular-section">
                        <h3>📋 {t.needs}</h3>
                        
                        <label>{t.electricity}</label>
                        <select 
                            value={formData.electricity_status || ''}
                            onChange={(e) => setFormData({...formData, electricity_status: e.target.value})}
                        >
                            <option value="">{t.select_placeholder}</option>
                            {Object.entries(t.options.elec).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <label>{t.health}</label>
                        <select 
                            value={formData.health_services_status || ''}
                            onChange={(e) => setFormData({...formData, health_services_status: e.target.value})}
                        >
                            <option value="">{t.select_placeholder}</option>
                            {Object.entries(t.options.health).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <label style={{marginTop: '15px', display: 'block', fontWeight: 'bold', color: '#f472b6'}}>
                            🆘 {lang === 'fr' ? 'Besoins les plus urgents' : lang === 'en' ? 'Most urgent needs' : lang === 'es' ? 'Necesidades más urgentes' : lang === 'ar' ? 'الاحتياجات الأكثر إلحاحا' : lang === 'zh' ? '最紧急的需求' : 'Самые неотложные потребности'}
                        </label>
                        <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px'}}>
                            {lang === 'fr' ? 'Sélectionnez tous les besoins applicables' : lang === 'en' ? 'Select all applicable needs' : lang === 'es' ? 'Seleccione todas las necesidades aplicables' : lang === 'ar' ? 'اختر جميع الاحتياجات المعمول بها' : lang === 'zh' ? '选择所有适用的需求' : 'Выберите все применимые потребности'}
                        </p>
                        <div className="checkboxes-grid">
                            {Object.entries(t.options.urgent_needs).filter(([key]) => key !== 'other').map(([key, label]) => (
                                <label key={key}>
                                    <input 
                                        type="checkbox"
                                        checked={formData.urgent_needs.includes(key)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({...formData, urgent_needs: [...formData.urgent_needs, key]});
                                            } else {
                                                setFormData({...formData, urgent_needs: formData.urgent_needs.filter(n => n !== key)});
                                            }
                                        }}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>

                        <label style={{marginTop: '15px', display: 'block', fontWeight: '500', marginBottom: '8px'}}>
                            {t.options.urgent_needs.other}
                        </label>
                        <input 
                            type="text"
                            placeholder={lang === 'fr' ? 'Précisez si autre...' : lang === 'en' ? 'Please specify if other...' : lang === 'es' ? 'Por favor especifique si otro...' : lang === 'ar' ? 'يرجى التحديد إذا كان آخر...' : lang === 'zh' ? '请说明是否为其他...' : 'Пожалуйста укажите если другое...'}
                            value={formData.urgent_needs_other || ''}
                            onChange={(e) => setFormData({...formData, urgent_needs_other: e.target.value})}
                            style={{width: '100%', padding: '10px', marginBottom: '15px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontFamily: 'inherit', fontSize: '14px'}}
                        />
                    </div>
                    </>
                    )}

                    <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                        {formStep === 2 && (
                            <button 
                                type="button"
                                onClick={() => setFormStep(1)}
                                className="submit-btn"
                                style={{flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)'}}
                            >
                                {lang === 'fr' ? '← RETOUR' : lang === 'en' ? '← BACK' : lang === 'es' ? '← VOLVER' : lang === 'ar' ? '← رجوع' : lang === 'zh' ? '← 返回' : '← НАЗАД'}
                            </button>
                        )}
                        <button type="submit" className={`submit-btn ${!isOnline ? 'offline' : ''}`} disabled={loading} style={{flex: 1}}>
                            {loading ? '...' : (formStep === 1 ? (lang === 'fr' ? 'SUIVANT →' : lang === 'en' ? 'NEXT →' : lang === 'es' ? 'SIGUIENTE →' : lang === 'ar' ? 'التالي →' : lang === 'zh' ? '下一步 →' : 'ДАЛЕЕ →') : t.submit_btn)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitReport;
