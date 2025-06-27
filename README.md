# FiBu-Assistent 📊

Eine moderne Next.js-Anwendung für die automatisierte Finanzbuchhaltung deutscher Unternehmergesellschaften (UG). 

Inspiriert von buchhaltungsbutler.de, automatisiert diese Anwendung die Kontierung von Eingangsrechnungen nach dem SKR03-Kontenrahmen.

## 🚀 Features

- **📤 Dokumenten-Upload**: Einfacher Upload von PDF-Rechnungen und Bildern per Drag & Drop
- **🤖 Automatische Verarbeitung**: OCR-Texterkennung und Datenextraktion aus Rechnungen
- **📊 SKR03-Kontierung**: Intelligente automatische Zuordnung zu SKR03-Konten
- **💼 Buchungsjournal**: Übersichtliche Verwaltung aller Buchungen
- **🇩🇪 Deutsche Compliance**: Berücksichtigung deutscher Buchhaltungsstandards (HGB, AO)
- **🔒 DSGVO-konform**: Sichere und rechtskonforme Datenverarbeitung

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Datenbank**: SQLite mit Prisma ORM
- **UI-Komponenten**: Lucide React Icons, Radix UI
- **Build-Tool**: Turbopack
- **Datei-Upload**: React Dropzone
- **OCR**: Tesseract.js (geplant)
- **PDF-Verarbeitung**: pdf-parse

## 🏁 Schnellstart

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn

### Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd dingo_dango
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Datenbank einrichten**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

5. **Anwendung öffnen**
   
   Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API-Routen
│   │   └── upload/        # Datei-Upload Endpoint
│   ├── invoices/          # Rechnungsübersicht
│   ├── upload/            # Upload-Seite
│   └── bookings/          # Buchungsjournal (geplant)
├── lib/                   # Utilities und Helpers
│   └── skr03.ts          # SKR03-Kontenrahmen Logic
└── components/            # React-Komponenten (geplant)

prisma/
├── schema.prisma         # Datenbankschema
└── dev.db               # SQLite-Datenbank
```

## 🎯 Kernfunktionalitäten

### 1. Rechnungs-Upload
- Unterstützte Formate: PDF, PNG, JPG, JPEG, GIF
- Maximale Dateigröße: 10MB
- Drag & Drop Interface
- Batch-Upload möglich

### 2. Automatische Verarbeitung
- OCR-Texterkennung aus PDFs und Bildern
- Extraktion von:
  - Lieferantendaten
  - Rechnungsnummer und -datum
  - Beträge (Netto, Brutto, MwSt.)
  - Fälligkeitsdatum

### 3. SKR03-Kontierung
- Automatische Kontenzuordnung basierend auf:
  - Rechnungsinhalt
  - Lieferantendaten
  - Keyword-Matching
- Über 30 vordefinierte SKR03-Konten
- Manuelle Korrekturen möglich

### 4. Buchungsjournal
- Übersicht aller Buchungen
- Filtermöglichkeiten
- Export-Funktionen (geplant)
- DATEV-kompatibel (geplant)

## 📊 SKR03-Kontenrahmen

Die Anwendung unterstützt die wichtigsten SKR03-Konten für UGs:

- **6000-6099**: Wareneinkauf
- **6100-6199**: Personal
- **6200-6299**: Raumkosten, Bankgebühren
- **6300-6399**: Versicherungen
- **6400-6499**: Kfz-Kosten
- **6500-6599**: Reisekosten
- **6600-6699**: Werbekosten
- **6800-6899**: Verschiedene Betriebsaufwendungen
- **7000-7199**: Zinsen und Steuern
- **8000-8999**: Umsatzerlöse

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
# Entwicklungsserver mit Turbopack
npm run dev

# Production Build
npm run build

# Production Server
npm run start

# Linting
npm run lint

# Prisma Commands
npx prisma studio          # Datenbank-Browser
npx prisma db push         # Schema zu DB übertragen
npx prisma generate        # Client generieren
```

### Code-Richtlinien

- Verwende TypeScript für alle neuen Dateien
- Folge den ESLint-Regeln
- Implementiere responsive Design mit Tailwind CSS
- Berücksichtige deutsche Buchhaltungsstandards
- Dokumentiere komplexe Geschäftslogik

## 🎨 UI/UX

- **Design**: Modern und clean mit Tailwind CSS
- **Icons**: Lucide React für konsistente Iconografie
- **Responsive**: Mobile-first Design
- **Accessibility**: ARIA-Standards befolgen
- **Deutsche Lokalisierung**: Alle Texte auf Deutsch

## 🔐 Sicherheit & Compliance

- **DSGVO-konform**: Datenschutz nach EU-Standards
- **Datensicherheit**: Sichere Dateispeicherung
- **HGB-konform**: Deutsche Buchhaltungsstandards
- **AO-konform**: Abgabenordnung berücksichtigt

## 🚧 Roadmap

### Version 1.0 (Aktuell)
- [x] Grundlegende UI/UX
- [x] Datei-Upload System
- [x] Datenbankstruktur
- [x] SKR03-Kontenrahmen
- [ ] OCR-Integration
- [ ] Automatische Kontierung

### Version 1.1 (Geplant)
- [ ] Buchungsjournal
- [ ] DATEV-Export
- [ ] Benutzerauthentifizierung
- [ ] Mandantenfähigkeit

### Version 2.0 (Zukunft)
- [ ] Mobile App
- [ ] API für Drittsysteme
- [ ] KI-basierte Kontierung
- [ ] Dashboard mit Analytics

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 📞 Support

Bei Fragen oder Problemen:

- Erstelle ein Issue auf GitHub
- Kontaktiere das Entwicklungsteam

---

**FiBu-Assistent** - Automatisierte Finanzbuchhaltung für deutsche UGs 🇩🇪
