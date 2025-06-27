import Link from 'next/link';
import { Upload, BookOpen, Calculator, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              FiBu-Assistent
            </h1>
            <nav className="flex space-x-6">
              <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                Upload
              </Link>
              <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
                Rechnungen
              </Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                Buchungen
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automatisierte Finanzbuchhaltung für Deutsche UGs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Laden Sie Ihre Eingangsrechnungen hoch und lassen Sie sie automatisch nach SKR03 kontieren. 
            Sparen Sie Zeit und reduzieren Sie Fehler in Ihrer Buchhaltung.
          </p>
          <div className="mt-8">
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Erste Rechnung hochladen
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Einfacher Upload</h3>
            <p className="text-gray-600">
              Laden Sie PDF-Rechnungen und Bilder direkt hoch. Drag & Drop oder Datei-Browser - ganz wie Sie möchten.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Calculator className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Automatische Kontierung</h3>
            <p className="text-gray-600">
              Intelligente Erkennung und automatische Zuordnung zu SKR03-Konten basierend auf Rechnungsinhalt.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <BookOpen className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Buchungsjournal</h3>
            <p className="text-gray-600">
              Übersichtliche Darstellung aller Buchungen mit Filtermöglichkeiten und Export-Funktionen.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-semibold text-center mb-8">Ihre Buchhaltung im Überblick</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Hochgeladene Rechnungen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Verarbeitete Dokumente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Buchungen erstellt</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">€0</div>
              <div className="text-gray-600">Gesamtvolumen</div>
            </div>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Deutsche Compliance
              </h4>
              <p className="text-blue-800">
                Diese Anwendung berücksichtigt deutsche Buchhaltungsstandards (HGB, AO) und 
                DSGVO-Konformität. Alle Daten werden sicher und rechtskonform verarbeitet.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
