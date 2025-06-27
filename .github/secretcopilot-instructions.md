<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Finanzbuchhaltungs-Web-Anwendung

Dies ist eine moderne Next.js-Anwendung für die automatisierte Finanzbuchhaltung einer deutschen Unternehmergesellschaft (haftungsbeschränkt).

## Projektkontext
- **Zielgruppe**: Einzelner Handwerksbetrieb im Bereich Elektrotechnik
- **Rechtsform**: Unternehmergesellschaft (haftungsbeschränkt)
- **Hauptfunktion**: Automatisierte FiBu nach SKR03
- **Vorbild**: buchhaltungsbutler.de
- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Turbopack

## Kernfunktionalitäten
1. **Dokumenten-Upload**: PDF von Eingangsrechnungen
2. **OCR & Datenextraktion**: Automatische Texterkennung und Extraktion relevanter Daten
3. **SKR03-Kontierung**: Automatische Zuordnung zu SKR03-Konten
4. **Buchungsjournal**: Übersicht und Verwaltung aller Buchungen
5. **Deutsche Compliance**: Berücksichtigung deutscher Buchhaltungsvorschriften

## Code-Richtlinien
- Verwende moderne TypeScript-Features
- Implementiere responsive Design mit Tailwind CSS
- Achte auf deutsche Buchhaltungsstandards (HGB, AO)
- Verwende Next.js App Router
- Implementiere Server-Side Rendering wo sinnvoll
- Berücksichtige Datenschutz (DSGVO)

## Wichtige Begriffe
- **SKR03**: Standardkontenrahmen für kleine und mittlere Unternehmen
- **UG**: Unternehmergesellschaft (deutsche Rechtsform)
- **Eingangsrechnung**: Von Lieferanten erhaltene Rechnungen
- **Kontierung**: Zuordnung von Geschäftsvorfällen zu Konten
