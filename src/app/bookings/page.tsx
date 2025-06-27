import Link from 'next/link';
import { Calendar, Euro, FileText, TrendingUp, TrendingDown, Building2, Hash } from 'lucide-react';
import { getSKR03AccountByCode } from '@/lib/skr03';

// Mock-Daten für Demo-Zwecke - später aus Datenbank laden
const mockBookings = [
  {
    id: '1',
    bookingDate: new Date('2024-01-16'),
    bookingText: 'Büromaterial und Software',
    debitAccount: '6815',
    creditAccount: '1600',
    amount: 287.50,
    vatRate: 19,
    invoiceId: 'demo-invoice-1',
    invoice: {
      supplierName: 'Büro & Mehr GmbH',
      invoiceNumber: 'R-2024-001',
      originalName: 'Büromaterial_Rechnung_Januar.pdf'
    },
    createdAt: new Date('2024-01-16')
  },
  {
    id: '2',
    bookingDate: new Date('2024-01-12'),
    bookingText: 'Webhosting und Domain',
    debitAccount: '6815',
    creditAccount: '1600',
    amount: 89.90,
    vatRate: 19,
    invoiceId: 'demo-invoice-2',
    invoice: {
      supplierName: 'TechHost Solutions',
      invoiceNumber: 'TH-2023-12-456',
      originalName: 'Webhosting_Dezember_2023.pdf'
    },
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    bookingDate: new Date('2024-01-08'),
    bookingText: 'Telefon und Internet',
    debitAccount: '6805',
    creditAccount: '1600',
    amount: 45.99,
    vatRate: 19,
    invoiceId: 'demo-invoice-3',
    invoice: {
      supplierName: 'Telekom Deutschland',
      invoiceNumber: 'TEL-202401-789',
      originalName: 'Telefon_Rechnung_Januar.pdf'
    },
    createdAt: new Date('2024-01-08')
  },
  {
    id: '4',
    bookingDate: new Date('2024-01-05'),
    bookingText: 'Honorar Elektroinstallation',
    debitAccount: '1400',
    creditAccount: '8400',
    amount: 1250.00,
    vatRate: 19,
    invoiceId: null,
    invoice: null,
    createdAt: new Date('2024-01-05')
  }
];

export default function BookingsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE').format(date);
  };

  const getAccountName = (accountCode: string) => {
    const account = getSKR03AccountByCode(accountCode);
    return account ? account.name : `Konto ${accountCode}`;
  };

  const isDebitBooking = (debitAccount: string) => {
    // Aufwandskonten beginnen meist mit 6 oder 7
    return debitAccount.startsWith('6') || debitAccount.startsWith('7');
  };

  const totalDebits = mockBookings
    .filter(booking => isDebitBooking(booking.debitAccount))
    .reduce((sum, booking) => sum + booking.amount, 0);

  const totalCredits = mockBookings
    .filter(booking => !isDebitBooking(booking.debitAccount))
    .reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              FiBu-Assistent
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                Upload
              </Link>
              <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
                Rechnungen
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buchungsjournal
          </h1>
          <p className="text-gray-600">
            Übersicht über alle Geschäftsvorfälle und Buchungen nach SKR03
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Buchungen gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{mockBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aufwendungen</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Erträge</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCredits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalCredits - totalDebits)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Buchungen</h2>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Neue Buchung
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buchungstext
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soll-Konto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Haben-Konto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MwSt.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beleg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.bookingDate)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingText}
                      </div>
                      {booking.invoice && (
                        <div className="text-sm text-gray-500">
                          {booking.invoice.supplierName} - {booking.invoice.invoiceNumber}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.debitAccount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getAccountName(booking.debitAccount)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.creditAccount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getAccountName(booking.creditAccount)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.amount)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.vatRate ? `${booking.vatRate}%` : '-'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.invoice ? (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <Link
                            href={`/invoices/${booking.invoiceId}`}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            Rechnung
                          </Link>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Keine</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Bearbeiten
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SKR03 Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Building2 className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                SKR03 Kontenrahmen
              </h4>
              <p className="text-blue-800 mb-3">
                Alle Buchungen folgen dem Standardkontenrahmen SKR03 für kleine und mittlere Unternehmen.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Hauptkontenklassen:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• 6000-6999: Betriebsaufwendungen</li>
                    <li>• 8000-8999: Umsatzerlöse</li>
                  </ul>
                </div>
                <div>
                  <strong>Häufige Konten:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• 6815: Bürobedarf</li>
                    <li>• 6805: Telefon</li>
                    <li>• 1600: Verbindlichkeiten</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {mockBookings.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Buchungen vorhanden
            </h3>
            <p className="text-gray-600 mb-6">
              Buchungen werden automatisch aus verarbeiteten Rechnungen erstellt.
            </p>
            <Link
              href="/invoices"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechnungen anzeigen
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
