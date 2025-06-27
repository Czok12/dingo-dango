# Frontend-Backend Integration Guide

**Dokumentation für Backend-Entwickler**  
**Projekt:** DingoDango - Automatisierte Finanzbuchhaltung  
**Frontend:** Next.js 15 + TypeScript + React Query  
**Backend:** Python FastAPI (zu implementieren)  
**Datum:** 27. Juni 2025

## Übersicht

Das Frontend ist vollständig implementiert und bereit für die Integration mit dem Python/FastAPI-Backend. Diese Dokumentation beschreibt die erwarteten API-Endpunkte, Datenstrukturen und Integrationsdetails.

## Backend-URL Konfiguration

### Environment-Variablen (Frontend)

```bash
# .env.local (Development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here

# .env.production (Production)
NEXT_PUBLIC_API_URL=https://api.dingodango.com
NEXT_PUBLIC_USE_MOCK_API=false
```

### Base URL
- **Development:** `http://localhost:8000`
- **Production:** `https://api.dingodango.com`
- **API-Version:** `/api/v1` (optional, konfigurierbar)

## API-Endpunkte (zu implementieren)

### 1. File Upload

**Endpoint:** `POST /api/v1/upload`

**Request:**
```typescript
Content-Type: multipart/form-data
Body: FormData mit File[]
```

**Response:**
```typescript
{
  "results": [
    {
      "id": "uuid",
      "filename": "generated_filename.pdf",
      "original_name": "Rechnung_123.pdf",
      "status": "uploaded" | "processing" | "completed" | "error",
      "file_size": 1234567,
      "mime_type": "application/pdf",
      "created_at": "2025-06-27T10:30:00Z"
    }
  ]
}
```

### 2. Invoices (Rechnungen)

**Endpoint:** `GET /api/v1/invoices`

**Query Parameters:**
```typescript
?page=1&limit=50&status=all&sort_by=created_at&sort_order=desc
```

**Response:**
```typescript
{
  "invoices": [
    {
      "id": "uuid",
      "filename": "generated_filename.pdf",
      "original_name": "Rechnung_123.pdf",
      "file_path": "/uploads/2025/06/generated_filename.pdf",
      "file_size": 1234567,
      "mime_type": "application/pdf",
      "status": "uploaded" | "processing" | "completed" | "error",
      
      // Extracted data (nach OCR/Verarbeitung)
      "supplier_name": "Büro & Mehr GmbH",
      "supplier_address": "Musterstraße 123, 12345 Berlin",
      "invoice_number": "R-2024-001",
      "invoice_date": "2024-01-15",
      "due_date": "2024-02-14",
      "total_amount": 287.50,
      "net_amount": 241.67,
      "vat_amount": 45.83,
      "vat_rate": 19,
      "currency": "EUR",
      
      // Processing results
      "processed": true,
      "booked": false,
      "skr03_account": "6815",
      "booking_text": "Büromaterial",
      "confidence_score": 0.95,
      "extraction_errors": [],
      
      "created_at": "2025-06-27T10:30:00Z",
      "updated_at": "2025-06-27T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 123,
    "pages": 3
  }
}
```

### 3. Bookings (Buchungen)

**Endpoint:** `GET /api/v1/bookings`

**Query Parameters:**
```typescript
?page=1&limit=50&date_from=2025-01-01&date_to=2025-12-31&account=6815
```

**Response:**
```typescript
{
  "bookings": [
    {
      "id": "uuid",
      "booking_date": "2025-06-27",
      "booking_text": "Büromaterial und Software",
      "debit_account": "6815",
      "credit_account": "1600",
      "amount": 287.50,
      "vat_amount": 45.83,
      "vat_rate": 19,
      "invoice_id": "uuid",
      "invoice": {
        "supplier_name": "Büro & Mehr GmbH",
        "invoice_number": "R-2024-001",
        "original_name": "Rechnung_123.pdf"
      },
      "created_at": "2025-06-27T10:30:00Z",
      "updated_at": "2025-06-27T10:30:00Z"
    }
  ],
  "totals": {
    "total_amount": 1234.56,
    "total_vat": 234.56,
    "booking_count": 15
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "pages": 1
  }
}
```

### 4. Processing Status

**Endpoint:** `GET /api/v1/invoices/{id}/status`

**Response:**
```typescript
{
  "id": "uuid",
  "status": "processing" | "completed" | "error",
  "progress": 75,
  "current_step": "ocr_extraction",
  "steps": [
    {
      "name": "file_upload",
      "status": "completed",
      "message": "Datei erfolgreich hochgeladen"
    },
    {
      "name": "ocr_extraction",
      "status": "running",
      "message": "Textextraktion läuft..."
    },
    {
      "name": "data_validation",
      "status": "pending",
      "message": "Warten auf Validierung"
    },
    {
      "name": "skr03_mapping",
      "status": "pending",
      "message": "SKR03-Zuordnung ausstehend"
    },
    {
      "name": "booking_creation",
      "status": "pending",
      "message": "Buchung erstellen"
    }
  ]
}
```

## Error Handling

### Standard Error Response

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die hochgeladene Datei ist kein gültiges PDF",
    "details": {
      "field": "file",
      "mime_type": "text/plain",
      "allowed_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "timestamp": "2025-06-27T10:30:00Z"
  }
}
```

### HTTP Status Codes

- `200` - Erfolg
- `201` - Ressource erstellt
- `400` - Ungültige Anfrage
- `401` - Nicht authentifiziert
- `403` - Nicht autorisiert
- `404` - Ressource nicht gefunden
- `413` - Datei zu groß
- `422` - Validierungsfehler
- `500` - Serverfehler

## CORS-Konfiguration

Das Backend muss CORS für das Frontend aktivieren:

```python
# FastAPI CORS Middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://dingodango.com", # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Datei-Upload Spezifikationen

### Unterstützte Dateiformate
- **PDF:** `application/pdf`
- **Bilder:** `image/jpeg`, `image/png`, `image/gif`

### Größenbeschränkungen
- **Maximum:** 10 MB pro Datei
- **Empfohlen:** 5 MB für optimale Performance

### Datei-Validierung
```python
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg", 
    "image/png",
    "image/gif"
]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

## SKR03-Konten Integration

Das Frontend erwartet, dass das Backend die SKR03-Konten kennt und automatisch zuordnet. Eine Referenz-Implementierung ist im Frontend verfügbar:

**Datei:** `src/lib/skr03.ts`

### Beispiel SKR03-Konten
```typescript
{
  code: "6815",
  name: "Sonstige betriebliche Aufwendungen",
  type: "Aufwendungen",
  description: "Büromaterial, Software, etc."
}
```

## Frontend API-Client

### Verwendete Libraries
- **HTTP-Client:** axios
- **State Management:** @tanstack/react-query
- **Error Handling:** react-hot-toast

### API-Client Konfiguration
```typescript
// src/services/api-client.ts
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: 30000, // 30 seconds for file uploads
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
};
```

## React Query Integration

### Caching-Strategien
- **Invoices:** 5 Minuten Cache
- **Bookings:** 5 Minuten Cache
- **Upload Status:** 30 Sekunden Cache (häufige Updates)

### Query Keys
```typescript
// Query Keys für Cache-Invalidierung
const QUERY_KEYS = {
  invoices: ['invoices'],
  bookings: ['bookings'],
  uploadStatus: (id: string) => ['upload-status', id],
};
```

## Authentifizierung (Vorbereitet)

Das Frontend ist für JWT-Authentifizierung vorbereitet:

### Headers
```typescript
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Auth-Endpoints (zu implementieren)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

## Testing & Development

### API-Mocking
Das Frontend unterstützt Mock-APIs für Entwicklung ohne Backend:

```bash
NEXT_PUBLIC_USE_MOCK_API=true
```

### Development Server
```bash
# Frontend starten
npm run dev  # Port 3000

# Backend sollte laufen auf:
# http://localhost:8000
```

### Testing URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1
- **API Docs:** http://localhost:8000/docs (FastAPI Swagger)

## Deployment

### Environment-spezifische URLs
```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Staging  
NEXT_PUBLIC_API_URL=https://staging-api.dingodango.com

# Production
NEXT_PUBLIC_API_URL=https://api.dingodango.com
```

### Health Check
Das Backend sollte einen Health-Check-Endpoint bereitstellen:

```
GET /api/v1/health
Response: {"status": "ok", "timestamp": "2025-06-27T10:30:00Z"}
```

## Monitoring & Logging

### Frontend-Logging
Das Frontend loggt wichtige Events:
- API-Fehler
- Upload-Status
- Performance-Metriken

### Backend-Logging (Empfehlung)
- Request/Response Logs
- Datei-Verarbeitungs-Status
- OCR-Ergebnisse
- Fehler-Details

## Kontakt & Support

**Frontend-Entwicklung:** Abgeschlossen  
**Status:** Bereit für Backend-Integration  
**Nächste Schritte:** Backend-Implementierung nach dieser Spezifikation

---

## Anhang: Frontend-Struktur

```
src/
├── app/
│   ├── layout.tsx          # React Query Provider
│   ├── page.tsx           # Startseite
│   ├── upload/page.tsx    # Upload-Interface
│   ├── invoices/page.tsx  # Rechnungsübersicht
│   └── bookings/page.tsx  # Buchungsjournal
├── lib/
│   └── skr03.ts          # SKR03-Konten-Referenz
└── services/
    ├── api-client.ts     # HTTP-Client für Backend
    └── api-hooks.ts      # React Query Hooks
```

Diese Dokumentation sollte dem Backend-Entwickler alle notwendigen Informationen für eine erfolgreiche Integration liefern. Bei Fragen oder Anpassungen kann die Spezifikation entsprechend erweitert werden.
