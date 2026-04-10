# ALERTO 🚨

**ALERTO** is an open-source Progressive Web App (PWA) designed to empower communities affected by crises. It enables real-time damage reporting, geolocation of affected infrastructure, and AI-driven damage classification to accelerate response within the critical first 48 hours.

## 🌟 Key Features

- **PWA Submission**: Capture photos, describe damages, and classify severity levels.
- **Offline First**: Works without internet via IndexedDB; syncs automatically when online.
- **Multilingual Support**: Arabic, Chinese, English, French, Russian, Spanish with automatic translation.
- **Interactive Mapping**: Real-time visualization of reports with heatmaps and critical zone analysis.
- **AI-Powered**: Automatic damage classification and duplicate detection.
- **Authority Dashboard**: Advanced filters and data export (CSV, GeoJSON, API).

## 🛠 Tech Stack

- **Frontend**: React (PWA with Service Workers) - Deployed on Vercel.
- **Backend**: FastAPI (Python) - Deployed on Render.
- **Database**: MongoDB Atlas (GeoJSON & Geospatial indexing).
- **Storage**: S3-compatible cloud storage for images.

## 📁 Project Structure

```text
ALERTO/
├── client/              # React PWA (Frontend)
│   ├── public/          # Static assets & Service Workers
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application views (Report, Map, Dashboard)
│   │   ├── services/    # API & Offline Sync logic
│   │   └── store/       # State management (IndexedDB)
│   └── package.json
├── server/              # FastAPI (Backend)
│   ├── app/
│   │   ├── api/         # Route handlers
│   │   ├── core/        # Configuration & Security
│   │   ├── models/      # MongoDB schemas (Pydantic/Beanie)
│   │   ├── services/    # AI, Translation, & Deduplication logic
│   │   └── main.py      # Entry point
│   ├── requirements.txt
│   └── Dockerfile
└── docs/                # Architecture & Documentation
```

## 🚀 Getting Started

Instructions for local setup will be added as implementation progresses.

---
*Built for the International Innovation Challenge (UNDP Context)*
