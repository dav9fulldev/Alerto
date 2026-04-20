# ALERTO 🚨

**ALERTO** is an open-source Progressive Web App (PWA) designed to empower communities affected by crises. It enables real-time damage reporting, geolocation of affected infrastructure, and AI-driven damage classification to accelerate response within the critical first 48 hours.

## 🌟 Key Features

- **PWA Submission**: Capture photos, describe damages, and classify severity levels.
- **Offline First**: Works without internet via IndexedDB; syncs automatically when online.
- **Multilingual Support**: Arabic, Chinese, English, French, Russian, Spanish with automatic translation.
- **Interactive Mapping**: Real-time visualization of reports with heatmaps, critical zone analysis & **country filtering**.
- **AI-Powered**: Automatic damage classification, duplicate detection & **NSFW content moderation**.
- **Content Moderation**: Hybrid offline/online NSFW detection to filter inappropriate imagery.
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

## �️ Country Filtering on Map

The interactive map supports **real-time country-based filtering** to:
- Filter crisis reports by specific countries
- Reduce data load and improve performance
- Focus on specific regions of interest
- Analyze regional disaster patterns

**Available on**: Map View (Authority Dashboard) & MapLayer component
**Implementation**: Geospatial queries via MongoDB 2dsphere indexing

## 🔒 Content Moderation System

ALERTO implements a **robust hybrid NSFW detection system** to ensure platform safety:

### Features
- **Offline Detection**: NudeNet ML model (no internet required) - GDPR compliant
- **Online Fallback**: Optional OpenAI API for additional verification
- **Configurable Thresholds**: Flag (0.7) & Reject (0.85) scores
- **Automatic Actions**: Image blurring, audit logging, admin notifications
- **Privacy-First**: No image data sent externally (offline mode default)

### Configuration
```bash
NSFW_ENABLED=true
NSFW_THRESHOLD=0.7              # Flag for review
NSFW_BLOCK_THRESHOLD=0.85       # Reject image
USE_ONLINE_MODERATION=false     # Optional
BLUR_NSFW_IMAGES=true          # Blur sensitive images
```

**Documentation**: See [NSFW_DETECTION_SYSTEM.md](docs/NSFW_DETECTION_SYSTEM.md)

## 🚀 Getting Started

Instructions for local setup will be added as implementation progresses.

---

## 📊 API Endpoints

### Report Management
- `POST /reports` - Create new crisis report (with NSFW validation)
- `GET /reports` - Retrieve all reports
- `GET /reports/{report_id}` - Get specific report
- `DELETE /reports/{report_id}` - Delete report
- `POST /reports/upload` - Upload image before report submission

### Statistics & Analysis
- `GET /analytics/stats` - Global dashboard statistics (Damage, Infra, NSFW)
- `GET /analytics/nsfw-review` - List of images flagged for manual review
- `GET /analytics/trends` - Daily report trends (last 7 days)

### Authentication (Authority/PNUD)
- `POST /auth/register` - Create a new authority account
- `POST /auth/login` - Authenticate and obtain JWT access token (OAuth2 standard)

### Data Formats & Sync
- `POST /reports/sync-offline` - Sync reports collected without internet
- **Export**: CSV, GeoJSON formats
- **Geospatial Queries**: MongoDB 2dsphere with country/region filtering

## 🔧 Advanced Configuration

### Database Setup
```javascript
// Essential indexes for optimal performance
db.reports.createIndex({ location: "2dsphere" })
db.reports.createIndex({ created_at: -1 })
db.reports.createIndex({ crisis_type: 1 })
db.reports.createIndex({ is_duplicate: 1 })
db.reports.createIndex({ is_flagged: 1 })  // NSFW
```

### Environment Variables
See `.env.example` in the `server/` directory for all configurable options including:
- NSFW thresholds & moderation settings
- Database connection strings
- Translation & storage configuration
- Logging levels

## 🧪 Testing

### Unit Tests
```bash
cd server
python test_nsfw_integration.py  # NSFW system verification
```

### Integration Testing
```bash
# Manually test endpoints via Swagger UI
http://localhost:8000/docs
```

## 📦 Deployment

### Development
```bash
# Terminal 1: Backend
cd server && python -m uvicorn main:app --reload

# Terminal 2: Frontend
cd client && npm run dev
```

### Production
- **Frontend**: Deploy React build to Vercel/Netlify
- **Backend**: Docker container on Render/Railway
- **Database**: MongoDB Atlas (cloud)
- **Storage**: S3-compatible cloud storage

**Deployment Documentation**: Detailed guides available in `docs/`

---
*Built for the PNUD Crisis Mapping Challenge (Deadline: June 23, 2026)*
