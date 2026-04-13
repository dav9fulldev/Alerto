import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useTranslation } from '../services/i18n';
import { COUNTRY_LIST, filterReportsByCountry, getCountryFromCoordinates } from '../services/countryFilter';
import { getCountryName } from '../services/countryNames';

const API_BASE = `http://${window.location.hostname}:8000`;
const API_URL = `${API_BASE}/reports/`;

const RecenterMap = ({ reports }) => {
    const map = useMap();
    useEffect(() => {
        if (reports.length > 0) {
            const lastReport = reports[reports.length - 1];
            const coords = lastReport.location.coordinates;
            map.setView([coords[1], coords[0]], 15);
        }
    }, [reports, map]);
    return null;
};

const MapView = () => {
    const [reports, setReports] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("All");
    const { t, lang } = useTranslation();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(API_URL);
                setReports(response.data);
            } catch (error) {
                console.error("Erreur chargement rapports:", error);
            }
        };
        fetchReports();
    }, []);

    const getMarkerOptions = (level) => {
        switch (level) {
            case 'complet': return { color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.8, radius: 10 };
            case 'partiel': return { color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.7, radius: 8 };
            default: return { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.6, radius: 6 };
        }
    };

    return (
        <div className="map-page">
            <div className="map-header">
                <h1>🚨 ALERTO - Carte SIG</h1>
                
                {/* Country Filter - Centered */}
                <div className="country-filter">
                    <label htmlFor="country-select">🌍 {lang === 'fr' ? 'Filtrer par pays:' : lang === 'es' ? 'Filtrar por país:' : lang === 'ar' ? 'تصفية حسب الدولة:' : lang === 'zh' ? '按国家筛选:' : lang === 'ru' ? 'Фильтровать по стране:' : 'Filter by country:'}</label>
                    <select 
                        id="country-select"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="country-selector"
                    >
                        <option value="All">{getCountryName("All", lang)}</option>
                        {COUNTRY_LIST.map(country => (
                            <option key={country} value={country}>
                                {getCountryName(country, lang)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="map-legend">
                    <div className="legend-item"><span className="dot critical"></span> {t.options.damage.complet}</div>
                    <div className="legend-item"><span className="dot partial"></span> {t.options.damage.partiel}</div>
                    <div className="legend-item"><span className="dot minimal"></span> {t.options.damage.minime}</div>
                </div>
            </div>

            <MapContainer
                center={[5, -5]}
                zoom={3}
                minZoom={3}
                maxZoom={21}
                maxBounds={[[-85, -180], [85, 180]]}
                maxBoundsViscosity={1.0}
                worldCopyJump={false}
                className="leaflet-container"
            >
                {/* Couche Satellite Esri (Mode Operationnel) */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                    maxZoom={21}
                    maxNativeZoom={18}
                    noWrap={true}
                />
                {/* Libellés de référence Esri */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                    maxZoom={21}
                    transparent={true}
                    opacity={0.8}
                    noWrap={true}
                />
                <RecenterMap reports={reports} />

                {filterReportsByCountry(reports, selectedCountry).map((report) => {
                    const coords = report.location.coordinates;
                    const options = getMarkerOptions(report.damage_level);

                    return (
                        <CircleMarker
                            key={report._id}
                            center={[coords[1], coords[0]]}
                            pathOptions={options}
                        >
                            <Popup className="custom-popup">
                                <div className="popup-content">
                                    {report.video_url ? (
                                        <video 
                                            src={report.video_url.startsWith('http') ? report.video_url : (report.video_url.startsWith('/') ? `${API_BASE}${report.video_url}` : `${API_BASE}/uploads/${report.video_url}`)} 
                                            controls 
                                            style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} 
                                        />
                                    ) : report.image_url && (
                                        <img 
                                            src={report.image_url.startsWith('http') ? report.image_url : (report.image_url.startsWith('/') ? `${API_BASE}${report.image_url}` : `${API_BASE}/uploads/${report.image_url}`)} 
                                            alt="Evidence" 
                                            style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} 
                                        />
                                    )}
                                    <h3>{report.infrastructure_type}</h3>
                                    <div className={`damage-tag ${report.damage_level}`}>
                                        {t.options.damage[report.damage_level]}
                                    </div>
                                    <p><strong>{lang === 'fr' ? 'Crise' : 'Crisis'}:</strong> {report.crisis_type}</p>
                                    <p className="description">{report.description}</p>
                                    <p className="location-text">📍 {report.text_location}</p>

                                    {report.contact_phone && (
                                        <p className="contact-phone" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                                            📞 <a href={`tel:${report.contact_phone}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                                                {report.contact_phone}
                                            </a>
                                        </p>
                                    )}

                                    <div className="popup-footer">
                                        <span className="timestamp">{new Date(report.created_at).toLocaleDateString()}</span>
                                        {report.source === 'offline' && <span className="offline-pill">SYNCED</span>}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
