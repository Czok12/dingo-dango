# Backend-Spezifikation: FiBu-Assistent Python/FastAPI Backend

## 📋 Projektübersicht

**Projekt**: Automatisierte Finanzbuchhaltung für deutsche UGs  
**Backend-Technologie**: Python + FastAPI  
**Frontend**: Next.js 15 (bereits implementiert)  
**Hauptfunktion**: OCR-basierte Rechnungsverarbeitung und SKR03-Kontierung

---

## 🎯 Anforderungen & Funktionsumfang

### Kernfunktionalitäten

1. **📤 Dokumenten-Upload & Verwaltung**
   - Upload von PDF, PNG, JPG, JPEG, GIF (max. 10MB)
   - Sichere Dateispeicherung mit eindeutigen IDs
   - Metadaten-Extraktion (Dateigröße, MIME-Type, etc.)

2. **🤖 OCR & Dokumentenverarbeitung**
   - Texterkennung aus PDFs und Bildern
   - Deutsche Texterkennung (Tesseract mit 'deu' Language Pack)
   - Bildvorverarbeitung für bessere OCR-Qualität
   - Strukturierte Datenextraktion aus Rechnungen

3. **📊 Intelligente Rechnungsanalyse**
   - Extraktion von Lieferantendaten, Rechnungsnummer, Datum
   - Beträge (Netto, Brutto, MwSt.) mit deutscher Formatierung
   - Fälligkeitsdatum und weitere Metadaten
   - Validierung der deutschen MwSt.-Sätze (7%, 19%)

4. **🧠 Automatische SKR03-Kontierung**
   - Keyword-basierte Kontenzuordnung
   - Machine Learning für verbesserte Genauigkeit
   - Konfidenz-Scores für Vorschläge
   - Lernfähiges System (kontinuierliche Verbesserung)

5. **💾 Datenmanagement**
   - RESTful APIs für CRUD-Operationen
   - Buchungsjournal-Verwaltung
   - Unternehmens-/Mandantenverwaltung
   - Audit-Logging für Compliance

---

## 🏗️ Technische Spezifikationen

### Tech Stack

```python
# Core Framework
fastapi>=0.104.0
uvicorn[standard]>=0.24.0

# Database & ORM
sqlalchemy>=2.0.0
alembic>=1.12.0
psycopg2-binary>=2.9.0  # PostgreSQL (empfohlen für Produktion)

# OCR & Document Processing
pytesseract>=0.3.10
pdf2image>=3.1.0
Pillow>=10.1.0
opencv-python>=4.8.0
PyPDF2>=3.0.0
pdfplumber>=0.9.0

# Machine Learning & Data Processing
scikit-learn>=1.3.0
pandas>=2.1.0
numpy>=1.25.0
nltk>=3.8.0

# Utilities
python-multipart>=0.0.6  # File uploads
python-jose[cryptography]  # JWT tokens
passlib[bcrypt]  # Password hashing
python-dotenv>=1.0.0
pydantic>=2.4.0
```

### Empfohlene Projektstruktur

```
fibu-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py              # Configuration management
│   ├── database.py            # Database connection & session
│   │
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── company.py
│   │   ├── invoice.py
│   │   ├── booking.py
│   │   └── skr03_account.py
│   │
│   ├── schemas/               # Pydantic schemas for API
│   │   ├── __init__.py
│   │   ├── invoice_schemas.py
│   │   ├── booking_schemas.py
│   │   └── company_schemas.py
│   │
│   ├── api/                   # API route handlers
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── invoices.py
│   │   │   ├── bookings.py
│   │   │   ├── companies.py
│   │   │   └── upload.py
│   │   └── dependencies.py
│   │
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── ocr_service.py
│   │   ├── invoice_parser.py
│   │   ├── skr03_service.py
│   │   └── ml_service.py
│   │
│   ├── utils/                 # Utilities & helpers
│   │   ├── __init__.py
│   │   ├── file_handler.py
│   │   ├── german_formats.py
│   │   └── skr03_data.py
│   │
│   └── tests/                 # Test suite
│       ├── __init__.py
│       ├── conftest.py
│       └── test_*.py
│
├── alembic/                   # Database migrations
├── uploads/                   # File storage (local dev)
├── requirements.txt
├── .env.example
├── docker-compose.yml
└── Dockerfile
```

---

## 📡 API-Spezifikation

### Base URL
```
Development: http://localhost:8000
Production: https://api.fibu-assistent.de
```

### Authentication
```http
Authorization: Bearer <JWT_TOKEN>
```

### Core Endpoints

#### 1. Upload & Processing

```http
POST /api/v1/upload/files
Content-Type: multipart/form-data

Body:
- files: File[] (multiple files supported)
- company_id: string (optional, default company)

Response:
{
  "results": [
    {
      "id": "uuid",
      "filename": "rechnung_001.pdf",
      "original_name": "Büromaterial Rechnung.pdf",
      "status": "uploaded|processing|completed|error",
      "file_size": 1234567,
      "mime_type": "application/pdf",
      "created_at": "2024-01-16T10:30:00Z"
    }
  ]
}
```

#### 2. Invoice Processing

```http
POST /api/v1/invoices/{invoice_id}/process

Response:
{
  "id": "uuid",
  "processing_status": "completed",
  "extracted_data": {
    "supplier_name": "Büro & Mehr GmbH",
    "supplier_tax_id": "DE123456789",
    "invoice_number": "R-2024-001",
    "invoice_date": "2024-01-15",
    "due_date": "2024-02-14",
    "total_amount": 287.50,
    "net_amount": 241.67,
    "vat_amount": 45.83,
    "vat_rate": 19.0,
    "line_items": [
      {
        "description": "Büromaterial Set",
        "quantity": 2,
        "unit_price": 50.00,
        "total": 100.00
      }
    ]
  },
  "suggested_booking": {
    "debit_account": "6815",
    "credit_account": "1600",
    "booking_text": "Büromaterial",
    "confidence": 0.95
  },
  "ocr_confidence": 0.87
}
```

#### 3. SKR03 Suggestions

```http
POST /api/v1/skr03/suggest
{
  "text": "Büromaterial Stifte Papier Software",
  "supplier_name": "Büro & Mehr GmbH",
  "amount": 287.50
}

Response:
{
  "suggestions": [
    {
      "account_code": "6815",
      "account_name": "Bürobedarf",
      "confidence": 0.95,
      "reasoning": ["büromaterial", "stifte", "papier"]
    },
    {
      "account_code": "6810",
      "account_name": "Zeitschriften, Bücher",
      "confidence": 0.25,
      "reasoning": ["software"]
    }
  ]
}
```

#### 4. CRUD Operations

```http
# Invoices
GET    /api/v1/invoices                    # List with pagination
GET    /api/v1/invoices/{id}               # Get single invoice
PUT    /api/v1/invoices/{id}               # Update invoice
DELETE /api/v1/invoices/{id}               # Delete invoice

# Bookings
GET    /api/v1/bookings                    # List bookings
POST   /api/v1/bookings                    # Create booking
PUT    /api/v1/bookings/{id}               # Update booking
DELETE /api/v1/bookings/{id}               # Delete booking

# Companies
GET    /api/v1/companies                   # List companies
POST   /api/v1/companies                   # Create company
PUT    /api/v1/companies/{id}              # Update company

# SKR03 Accounts
GET    /api/v1/skr03/accounts              # List all accounts
GET    /api/v1/skr03/accounts/{code}       # Get specific account
```

---

## 💾 Datenmodelle

### Invoice Model

```python
class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    
    # Extracted data
    supplier_name = Column(String)
    supplier_tax_id = Column(String)
    invoice_number = Column(String)
    invoice_date = Column(Date)
    due_date = Column(Date)
    total_amount = Column(Numeric(10, 2))
    net_amount = Column(Numeric(10, 2))
    vat_amount = Column(Numeric(10, 2))
    vat_rate = Column(Numeric(5, 2))
    
    # Processing status
    ocr_text = Column(Text)
    processed = Column(Boolean, default=False)
    processing_error = Column(String)
    ocr_confidence = Column(Numeric(3, 2))
    
    # Booking information
    booked = Column(Boolean, default=False)
    suggested_account = Column(String)
    booking_text = Column(String)
    suggestion_confidence = Column(Numeric(3, 2))
    
    # Relationships
    company_id = Column(String, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="invoices")
    bookings = relationship("Booking", back_populates="invoice")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Booking Model

```python
class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_date = Column(Date, nullable=False)
    booking_text = Column(String, nullable=False)
    debit_account = Column(String, nullable=False)
    credit_account = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    vat_rate = Column(Numeric(5, 2))
    
    # References
    invoice_id = Column(String, ForeignKey("invoices.id"))
    invoice = relationship("Invoice", back_populates="bookings")
    company_id = Column(String, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="bookings")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## 🔧 Konfiguration & Environment

### Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fibu_db
# DATABASE_URL=sqlite:///./fibu.db  # For development

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# OCR Configuration
TESSERACT_PATH=/usr/bin/tesseract  # System-specific
TESSERACT_LANG=deu

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=INFO
```

---

## 🧪 Entwicklungs- & Test-Guidelines

### Code Quality Standards

```python
# Type hints are mandatory
def process_invoice(invoice_id: str) -> InvoiceProcessingResult:
    pass

# Docstrings for all public functions
def extract_invoice_data(file_path: str) -> Dict[str, Any]:
    """
    Extract structured data from invoice file using OCR.
    
    Args:
        file_path: Path to the invoice file
        
    Returns:
        Dictionary containing extracted invoice data
        
    Raises:
        OCRError: If text extraction fails
        ValidationError: If extracted data is invalid
    """
    pass
```

### Testing Requirements

```python
# Test coverage minimum: 80%
# Required test types:
# - Unit tests for all services
# - Integration tests for API endpoints
# - OCR accuracy tests with sample documents
# - Performance tests for file processing

# Example test structure:
def test_ocr_service_german_invoice():
    # Test German invoice OCR with known sample
    pass

def test_skr03_suggestion_accuracy():
    # Test SKR03 account suggestions with various texts
    pass

async def test_upload_endpoint():
    # Test file upload with various file types
    pass
```

---

## 🚀 Deployment & DevOps

### Docker Configuration

```dockerfile
FROM python:3.11-slim

# Install system dependencies for OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-deu \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Development Setup

```bash
# 1. Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Database setup
alembic upgrade head

# 4. Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📊 Performance & Monitoring

### Performance Ziele

- **File Upload**: < 2s für 10MB Dateien
- **OCR Processing**: < 10s für durchschnittliche Rechnung
- **API Response Time**: < 200ms für CRUD-Operationen
- **Concurrent Users**: Mindestens 50 gleichzeitige Uploads

### Monitoring Anforderungen

```python
# Metrics to track:
# - OCR processing times
# - API response times  
# - Error rates by endpoint
# - File processing success rates
# - SKR03 suggestion accuracy
# - Database query performance

# Logging example:
import logging
logger = logging.getLogger("fibu_backend")

async def process_invoice_with_metrics(invoice_id: str):
    start_time = time.time()
    try:
        result = await process_invoice(invoice_id)
        processing_time = time.time() - start_time
        logger.info(f"Invoice {invoice_id} processed in {processing_time:.2f}s")
        return result
    except Exception as e:
        logger.error(f"Invoice {invoice_id} processing failed: {str(e)}")
        raise
```

---

## 🔒 Sicherheit & Compliance

### Sicherheitsanforderungen

1. **Authentifizierung**: JWT-basierte API-Authentifizierung
2. **Dateisicherheit**: Sichere Dateispeicherung mit Virus-Scanning
3. **Input Validation**: Strenge Validierung aller Eingaben
4. **Rate Limiting**: API-Rate-Limiting implementieren
5. **HTTPS**: Nur verschlüsselte Verbindungen in Produktion

### DSGVO-Compliance

```python
# Data retention policies
INVOICE_RETENTION_YEARS = 10  # German law requirement
PERSONAL_DATA_RETENTION_YEARS = 2

# Audit logging
class AuditLog(Base):
    id = Column(String, primary_key=True)
    user_id = Column(String)
    action = Column(String)  # CREATE, READ, UPDATE, DELETE
    resource_type = Column(String)  # invoice, booking, company
    resource_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
```

---

## 📞 Support & Kommunikation

### Frontend-Integration

**Aktuelle Frontend-Endpunkte, die migriert werden müssen:**

```typescript
// Existing Next.js API routes to replace:
// /api/upload -> Python Backend
// Future: Invoice processing, SKR03 suggestions

// Frontend environment configuration:
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

### Staging Environment

```bash
# Staging setup for testing
API_URL: https://staging-api.fibu-assistent.de
Database: PostgreSQL (separate staging DB)
File Storage: AWS S3 or local storage
```

---

## ✅ Akzeptanzkriterien

### Minimum Viable Product (MVP)

- [ ] **File Upload**: Multipart-Upload mit Validierung
- [ ] **OCR Processing**: Deutsche Texterkennung aus PDF/Bildern
- [ ] **Data Extraction**: Grundlegende Rechnungsdaten extrahieren
- [ ] **SKR03 Integration**: Top 20 SKR03-Konten automatisch zuordnen
- [ ] **API Documentation**: OpenAPI/Swagger-Dokumentation
- [ ] **Error Handling**: Robuste Fehlerbehandlung mit klaren Meldungen

### Nice-to-Have Features

- [ ] **ML Learning**: Kontinuierliche Verbesserung der Kontierungsgenauigkeit
- [ ] **Batch Processing**: Mehrere Dateien gleichzeitig verarbeiten
- [ ] **Advanced OCR**: Handschrifterkennung und komplexe Layouts
- [ ] **Export Functions**: DATEV-Export für Steuerberater
- [ ] **Webhook Support**: Benachrichtigungen an Frontend bei Verarbeitungsabschluss

---

## 📚 Zusätzliche Ressourcen

### Deutsche Buchhaltungsstandards

- **SKR03-Referenz**: [DATEV SKR03-Dokumentation]
- **MwSt.-Sätze**: 7% (ermäßigt), 19% (regulär)
- **Aufbewahrungsfristen**: 10 Jahre für Rechnungen
- **HGB/AO-Compliance**: Deutsche Buchhaltungsgesetze

### Beispiel-Rechnungen für Tests

```
Testdaten benötigt:
- 20-30 deutsche Muster-Rechnungen (PDF)
- Verschiedene Layouts und Lieferanten
- Handschriftliche Notizen auf Rechnungen
- Rechnungen mit verschiedenen MwSt.-Sätzen
- Fehlerhafte/unvollständige Rechnungen für Edge Cases
```

---

**Diese Spezifikation bietet alle notwendigen Informationen für die Entwicklung eines robusten Python/FastAPI-Backends. Bei Fragen oder Unklarheiten stehe ich gerne zur Verfügung!** 🚀
