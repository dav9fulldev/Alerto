import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { 
  AlertTriangle, MapPin, Navigation, Droplets, Flame, Building2, 
  Bomb, PlusCircle, Plus, Minus, Users, ChevronRight, X, Filter, RefreshCw
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../services/i18n';
import './PublicMap.css';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    MAP_CATEGORIES,
    defaultFilterTypesState,
    normalizeCrisisCategory,
    isWithinMapPeriod
} from '../utils/crisisCategories';

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    useEffect(() => {
        if (zoom !== undefined) map.setZoom(zoom, { animate: true });
    }, [zoom, map]);
    return null;
};

const MapAutoFixer = ({ trigger }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            const fix = () => map.invalidateSize();
            fix();
            const timers = [100, 500, 1000].map((ms) => setTimeout(fix, ms));
            return () => timers.forEach((t) => clearTimeout(t));
        }
    }, [map, trigger]);
    return null;
};

const MapBoundsSetter = ({ reports }) => {
    const map = useMap();
    useEffect(() => {
        if (reports?.length > 0 && map) {
            const valid = reports.filter((r) => r.location?.coordinates);
            if (valid.length > 0) {
                const bounds = L.latLngBounds(
                    valid.map((r) => [r.location.coordinates[1], r.location.coordinates[0]])
                );
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [reports, map]);
    return null;
};

const PublicMap = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [center, setCenter] = useState([5.3484, -4.0305]);
    const [zoomLevel, setZoomLevel] = useState(12);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('7_days');
    const [filterDamage, setFilterDamage] = useState({ minime: true, partiel: true, complet: true });
    const [filterTypes, setFilterTypes] = useState(defaultFilterTypesState());

    const icons = {
        Inondation: <Droplets size={16} color="white" />,
        Incendie: <Flame size={16} color="white" />,
        Effondrement: <Building2 size={16} color="white" />,
        Conflit: <Bomb size={16} color="white" />,
        Autre: <AlertTriangle size={16} color="white" />
    };

    const colors = {
        Inondation: '#3b82f6',
        Incendie: '#ef4444',
        Effondrement: '#f59e0b',
        Conflit: '#8b5cf6',
        Autre: '#10b981'
    };

    const createCustomMarker = (category) => {
        const color = colors[category] || '#3b82f6';
        const iconMarkup = renderToStaticMarkup(
            <div className={`map-marker-glow ${category.toLowerCase()}`} style={{ backgroundColor: color }}>
                {icons[category] || <AlertTriangle size={14} color="white" />}
            </div>
        );
        return L.divIcon({ className: 'custom-glow-icon', html: iconMarkup, iconSize: [40, 40], iconAnchor: [20, 20] });
    };

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/`);
            setReports(res.data || []);
        } catch (err) {
            console.error('Error fetching reports', err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            const category = normalizeCrisisCategory(r.crisis_type);
            const matchPill = activeFilter === (t?.map?.all || 'Tous') || activeFilter === 'Tous' || category === activeFilter;
            const matchType = filterTypes[category] !== false;
            const matchDamage = filterDamage[r.damage_level] !== false;
            const matchPeriod = isWithinMapPeriod(r.created_at, filterPeriod);
            return matchPill && matchType && matchDamage && matchPeriod && r.location?.coordinates;
        });
    }, [reports, activeFilter, filterTypes, filterDamage, filterPeriod, t?.map?.all]);

    const pillFilters = [t?.map?.all || 'Tous', ...MAP_CATEGORIES.filter((c) => c !== 'Autre'), 'Conflit'];

    return (
        <div className="public-map-container-premium">
            <header className="map-header-premium">
                <h1>{t?.map?.title || 'Carte des alertes'}</h1>
                <button type="button" className="map-settings-btn" onClick={fetchReports} title={t?.map?.refresh || 'Actualiser'}>
                    <RefreshCw size={18} />
                </button>
            </header>

            <div className="map-filters-bar-premium">
                <div className="filters-scroll-premium">
                    {pillFilters.map((f) => (
                        <button
                            key={f}
                            type="button"
                            className={`map-filter-pill ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button type="button" className="map-settings-btn" onClick={() => setIsFiltersOpen(true)}>
                    <Filter size={18} />
                </button>
            </div>

            {isFiltersOpen && (
                <div className="filters-overlay-premium" onClick={() => setIsFiltersOpen(false)}>
                    <div className="filters-panel-premium" onClick={(e) => e.stopPropagation()}>
                        <header className="filters-header-premium">
                            <h2>{t?.map?.filters || 'Filtres'}</h2>
                            <button type="button" className="close-btn-premium" onClick={() => setIsFiltersOpen(false)}><X size={24} /></button>
                        </header>

                        <div className="filters-scroll-content">
                            <div className="filter-section">
                                <label className="section-label">{t?.map?.period || 'Période'}</label>
                                <div className="select-wrapper-premium">
                                    <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                                        <option value="24h">{t?.map?.period_24h || 'Dernières 24 heures'}</option>
                                        <option value="7_days">{t?.map?.period_7d || '7 derniers jours'}</option>
                                        <option value="30_days">{t?.map?.period_30d || '30 derniers jours'}</option>
                                    </select>
                                    <ChevronRight size={18} className="select-arrow" />
                                </div>
                            </div>

                            <div className="filter-section">
                                <label className="section-label">{t?.map?.damage_level || 'Niveau de dégâts'}</label>
                                <div className="checkbox-list-premium">
                                    {['minime', 'partiel', 'complet'].map((level) => (
                                        <label key={level} className="checkbox-item-premium">
                                            <input
                                                type="checkbox"
                                                checked={filterDamage[level]}
                                                onChange={() => setFilterDamage({ ...filterDamage, [level]: !filterDamage[level] })}
                                            />
                                            <div className={`custom-check ${level}`}></div>
                                            <span>{t?.options?.damage?.[level] || level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <label className="section-label">{t?.map?.incident_types || "Types d'incidents"}</label>
                                <div className="incident-grid-premium">
                                    {MAP_CATEGORIES.map((type) => (
                                        <label key={type} className={`incident-item-premium ${filterTypes[type] ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={filterTypes[type]}
                                                onChange={() => setFilterTypes({ ...filterTypes, [type]: !filterTypes[type] })}
                                            />
                                            <div className={`icon-box ${type.toLowerCase()}`}>{icons[type]}</div>
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <footer className="filters-footer-premium">
                            <button
                                type="button"
                                className="btn-reset-premium"
                                onClick={() => {
                                    setFilterDamage({ minime: true, partiel: true, complet: true });
                                    setFilterTypes(defaultFilterTypesState());
                                    setFilterPeriod('7_days');
                                }}
                            >
                                {t?.map?.reset || 'Réinitialiser'}
                            </button>
                            <button type="button" className="btn-apply-premium" onClick={() => setIsFiltersOpen(false)}>
                                {t?.map?.apply || 'Appliquer'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <MapContainer center={center} zoom={zoomLevel} zoomControl={false} style={{ flex: 1, width: '100%', position: 'relative' }} minZoom={4} worldCopyJump>
                <MapController center={center} zoom={zoomLevel} />
                <MapBoundsSetter reports={filteredReports} />
                <MapAutoFixer trigger={`${activeFilter}-${filterPeriod}`} />
                <TileLayer url="https://mt1.google.com/vt/lyrs=y,h&x={x}&y={y}&z={z}" attribution="&copy; Google" noWrap />

                {filteredReports.map((report) => {
                    const category = normalizeCrisisCategory(report.crisis_type);
                    return (
                        <Marker
                            key={report._id}
                            position={[report.location.coordinates[1], report.location.coordinates[0]]}
                            icon={createCustomMarker(category)}
                        >
                            <Popup className="premium-popup">
                                <div className="popup-card-premium">
                                    {report.image_url && (
                                        <img
                                            src={
                                                report.image_url.startsWith('http')
                                                    ? report.image_url
                                                    : `${API_BASE}${report.image_url}`
                                            }
                                            alt="Sinistre"
                                        />
                                    )}
                                    <div className="popup-info-premium">
                                        <h3>{report.crisis_type}</h3>
                                        <p>
                                            <MapPin size={12} /> {report.text_location || '…'}
                                        </p>
                                        <p className="popup-damage-tag">{report.damage_level}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <button
                type="button"
                className="my-pos-btn-floating"
                onClick={() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            setCenter([pos.coords.latitude, pos.coords.longitude]);
                            setZoomLevel(15);
                        });
                    }
                }}
            >
                <Navigation size={18} /> <span>{t?.map?.my_position || 'Ma position'}</span>
            </button>

            <div className="zoom-ctrl-pill">
                <button type="button" className="zoom-btn" onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 19))}><Plus size={20} /></button>
                <div className="zoom-divider"></div>
                <button type="button" className="zoom-btn" onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 3))}><Minus size={20} /></button>
            </div>

            <div className="map-legend-bar-premium">
                {MAP_CATEGORIES.map((cat) => (
                    <div key={cat} className="legend-item-premium">
                        <div className="icon-box" style={{ background: colors[cat] }}>{icons[cat]}</div>
                        <span>{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublicMap;
