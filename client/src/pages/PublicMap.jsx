import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { 
  AlertTriangle, MapPin, Navigation, Droplets, Flame, Car, Home, 
  ShieldAlert, Bomb, PlusCircle, Layers, Mountain, Wind, Trees, RefreshCw
} from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './PublicMap.css';
import { renderToStaticMarkup } from 'react-dom/server';

const MapAutoFixer = ({ trigger }) => {
    const map = useMap();
    const fixMap = useCallback(() => {
        if (map) {
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 200);
            setTimeout(() => map.invalidateSize(), 1000);
            setTimeout(() => map.invalidateSize(), 3000);
        }
    }, [map]);
    useEffect(() => {
        fixMap();
        window.addEventListener('resize', fixMap);
        return () => window.removeEventListener('resize', fixMap);
    }, [fixMap, trigger]);
    return null;
};

const MapBoundsSetter = ({ reports }) => {
    const map = useMap();
    useEffect(() => {
        if (reports && reports.length > 0 && map) {
            const bounds = L.latLngBounds(reports.map(r => [r.location.coordinates[1], r.location.coordinates[0]]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [reports, map]);
    return null;
};

const PublicMap = () => {
    const { t, lang } = useTranslation();
    const [reports, setReports] = useState([]);
    const [center, setCenter] = useState([5.3484, -4.0305]); // Abidjan default
    const [isSatellite, setIsSatellite] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Filter states
    const [filterPeriod, setFilterPeriod] = useState('7_days');
    const [filterDamage, setFilterDamage] = useState({ minime: true, partiel: true, complet: true });
    const [filterTypes, setFilterTypes] = useState({ inondation: true, incendie: true, effondrement: true, conflit: true, autre: true });

    const icons = {
        'Tremblement de terre': <Mountain size={20} color="white" />, 'Earthquake': <Mountain size={20} color="white" />, 'Землетрясение': <Mountain size={20} color="white" />,
        'Inondation': <Droplets size={20} color="white" />, 'Flood': <Droplets size={20} color="white" />, 'Наводнение': <Droplets size={20} color="white" />,
        'Tsunami': <PlusCircle size={20} color="white" />,
        'Ouragan / Cyclone': <Wind size={20} color="white" />, 'Hurricane / Cyclone': <Wind size={20} color="white" />,
        'Feu de forêt': <Trees size={20} color="white" />, 'Wildfire': <Trees size={20} color="white" />,
        'Explosion': <Bomb size={20} color="white" />,
        'Incident chimique': <ShieldAlert size={20} color="white" />,
        'Conflit': <ShieldAlert size={20} color="white" />,
        'Troubles civils': <PlusCircle size={20} color="white" />
    };

    const getDamageColor = (level) => {
        if (level === 'complet') return '#ef4444';
        if (level === 'partiel') return '#f59e0b';
        return '#10b981';
    };

    const createIcon = (type, level) => {
        const color = getDamageColor(level);
        const iconMarkup = renderToStaticMarkup(
            <div style={{ 
                backgroundColor: color, width: '34px', height: '34px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid white'
            }}>
                {icons[type] || <AlertTriangle size={18} color="white" />}
            </div>
        );
        return L.divIcon({ className: 'custom-leaflet-icon', html: iconMarkup, iconSize: [34, 34], iconAnchor: [17, 34] });
    };

    useEffect(() => {
        fetchReports();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => setCenter([pos.coords.latitude, pos.coords.longitude]), null, { enableHighAccuracy: true });
        }
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/`);
            setReports(res.data);
        } catch (err) { console.error("Error fetching reports", err); }
    };

    return (
        <div className="public-map-container">
            <header className="map-header-overlay">
                <div className="map-search-mock">
                    <Navigation size={18} color="#0ea5e9" />
                    <span className="search-text">ALERTO — Carte des alertes</span>
                </div>
                <button className="map-filter-trigger" onClick={() => setIsFiltersOpen(true)}>
                    <div className="filter-dot-active"></div>
                    <PlusCircle size={20} style={{ transform: 'rotate(45deg)' }} />
                </button>
            </header>

            <button className={`sat-toggle-btn ${isSatellite ? 'active' : ''}`} onClick={() => setIsSatellite(!isSatellite)}>
                <Layers size={20} />
                <span>{isSatellite ? 'Standard' : 'Satellite'}</span>
            </button>

            {isFiltersOpen && (
                <div className="filters-overlay">
                    <div className="filters-panel">
                        <header className="filters-header">
                            <h3>Filtres</h3>
                            <button className="close-filters" onClick={() => setIsFiltersOpen(false)}><X size={24} /></button>
                        </header>
                        
                        <div className="filters-body">
                            <div className="filter-group">
                                <label>Période</label>
                                <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                                    <option value="24h">Dernières 24 heures</option>
                                    <option value="7_days">7 derniers jours</option>
                                    <option value="30_days">30 derniers jours</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Niveau de dégâts</label>
                                <div className="check-list">
                                    <label className="check-item">
                                        <input type="checkbox" checked={filterDamage.minime} onChange={() => setFilterDamage({...filterDamage, minime: !filterDamage.minime})} />
                                        <div className="custom-check green"></div>
                                        <span>Minime</span>
                                    </label>
                                    <label className="check-item">
                                        <input type="checkbox" checked={filterDamage.partiel} onChange={() => setFilterDamage({...filterDamage, partiel: !filterDamage.partiel})} />
                                        <div className="custom-check orange"></div>
                                        <span>Partiel</span>
                                    </label>
                                    <label className="check-item">
                                        <input type="checkbox" checked={filterDamage.complet} onChange={() => setFilterDamage({...filterDamage, complet: !filterDamage.complet})} />
                                        <div className="custom-check red"></div>
                                        <span>Complet</span>
                                    </label>
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Types d'incidents</label>
                                <div className="check-list-icons">
                                    <label className="check-item-icon">
                                        <input type="checkbox" checked={filterTypes.inondation} onChange={() => setFilterTypes({...filterTypes, inondation: !filterTypes.inondation})} />
                                        <div className="icon-check-box blue"><Droplets size={16} /></div>
                                        <span>Inondation</span>
                                    </label>
                                    <label className="check-item-icon">
                                        <input type="checkbox" checked={filterTypes.incendie} onChange={() => setFilterTypes({...filterTypes, incendie: !filterTypes.incendie})} />
                                        <div className="icon-check-box red"><Flame size={16} /></div>
                                        <span>Incendie</span>
                                    </label>
                                    <label className="check-item-icon">
                                        <input type="checkbox" checked={filterTypes.effondrement} onChange={() => setFilterTypes({...filterTypes, effondrement: !filterTypes.effondrement})} />
                                        <div className="icon-check-box orange"><Building2 size={16} /></div>
                                        <span>Effondrement</span>
                                    </label>
                                    <label className="check-item-icon">
                                        <input type="checkbox" checked={filterTypes.conflit} onChange={() => setFilterTypes({...filterTypes, conflit: !filterTypes.conflit})} />
                                        <div className="icon-check-box purple"><ShieldAlert size={16} /></div>
                                        <span>Conflit</span>
                                    </label>
                                    <label className="check-item-icon">
                                        <input type="checkbox" checked={filterTypes.autre} onChange={() => setFilterTypes({...filterTypes, autre: !filterTypes.autre})} />
                                        <div className="icon-check-box green"><PlusCircle size={16} /></div>
                                        <span>Autre</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <footer className="filters-footer">
                            <button className="btn-reset" onClick={() => {
                                setFilterDamage({ minime: true, partiel: true, complet: true });
                                setFilterTypes({ inondation: true, incendie: true, effondrement: true, conflit: true, autre: true });
                            }}>Réinitialiser</button>
                            <button className="btn-apply" onClick={() => setIsFiltersOpen(false)}>Appliquer</button>
                        </footer>
                    </div>
                </div>
            )}

            <MapContainer key={`${isSatellite ? 'sat' : 'std'}`} center={center} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }} preferCanvas={false}>
                <MapAutoFixer trigger={isSatellite} />
                <MapBoundsSetter reports={reports} />
                {isSatellite ? (
                    <TileLayer url="https://mt1.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}" attribution='&copy; Google' maxZoom={20} />
                ) : (
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' maxZoom={19} />
                )}
                
                {reports.map((report) => (
                    <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]} icon={createIcon(report.crisis_type, report.damage_level)}>
                        <Popup className="modern-popup">
                            <div className="popup-card">
                                {report.image_url && <img src={report.image_url.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`} alt="Sinistre" />}
                                <div className="popup-info">
                                    <div className="popup-badge" style={{ background: getDamageColor(report.damage_level) }}>
                                        {t.options?.damage?.[report.damage_level] || report.damage_level?.toUpperCase()}
                                    </div>
                                    <h3>{report.crisis_type}</h3>
                                    <p className="popup-loc"><MapPin size={12} /> {report.text_location || '...'}</p>
                                    <p className="popup-desc">{report.description}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="map-controls-vertical">
                <button className="ctrl-btn" onClick={fetchReports} title="Rafraîchir">
                    <RefreshCw size={20} />
                </button>
                <button className="ctrl-btn" onClick={() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => setCenter([pos.coords.latitude, pos.coords.longitude]));
                    }
                }} title="Ma position">
                    <Navigation size={20} />
                </button>
            </div>

            <div className="map-legend-fab">
                <div className="legend-item"><div className="dot" style={{background: '#3b82f6'}}></div> <span>Inondation</span></div>
                <div className="legend-item"><div className="dot" style={{background: '#ef4444'}}></div> <span>Incendie</span></div>
                <div className="legend-item"><div className="dot" style={{background: '#f59e0b'}}></div> <span>Effondrement</span></div>
                <div className="legend-item"><div className="dot" style={{background: '#8b5cf6'}}></div> <span>Conflit</span></div>
                <div className="legend-item"><div className="dot" style={{background: '#10b981'}}></div> <span>Autre</span></div>
            </div>
        </div>
    );
};

export default PublicMap;
