import Link from 'next/link';
import { FileText, Calendar, Euro, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';

// Mock-Daten für Demo-Zwecke
const mockInvoices = [
  {
    id: '1',
    filename: 'rechnung_123.pdf',
    originalName: 'Büromaterial_Januar_2024.pdf',
    supplierName: 'Büro & Mehr GmbH',
    invoiceNumber: 'R-2024-001',
    invoiceDate: new Date('2024-01-15'),
    totalAmount: 287.50,
    vatAmount: 45.83,
    netAmount: 241.67,
    vatRate: 19,
    processed: true,
    booked: false,
    skr03Account: '6815',
    bookingText: 'Büromaterial',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    filename: 'rechnung_456.pdf',
    originalName: 'Webhosting_Dezember_2023.pdf',
    supplierName: 'TechHost Solutions',
    invoiceNumber: 'TH-2023-12-456',
    invoiceDate: new Date('2023-12-30'),
    totalAmount: 89.90,
    vatAmount: 14.31,
    netAmount: 75.59,
    vatRate: 19,
    processed: true,
    booked: true,
    skr03Account: '6815',
    bookingText: 'IT-Dienstleistungen',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    filename: 'rechnung_789.pdf',
    originalName: 'Smartphone_Rechnung.pdf',
    supplierName: 'Mobilfunk AG',
    invoiceNumber: 'MF-789123',
    invoiceDate: new Date('2024-01-10'),
    totalAmount: 45.99,
    vatAmount: 7.32,
    netAmount: 38.67,
    vatRate: 19,
    processed: false,
    booked: false,
    skr03Account: null,
    bookingText: null,
    createdAt: new Date('2024-01-12'),
  }
];

export default function InvoicesPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE').format(date);
  };

  const getStatusBadge = (processed: boolean, booked: boolean) => {
    if (booked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Gebucht
        </span>
      );
    } else if (processed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Verarbeitet
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Nicht verarbeitet
        </span>
      );
    }
  };

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
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                Buchungen
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Eingangsrechnungen
          </h1>
          <p className="text-gray-600">
            Übersicht über alle hochgeladenen und verarbeiteten Rechnungen
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{mockInvoices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gebucht</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockInvoices.filter(inv => inv.booked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ausstehend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockInvoices.filter(inv => inv.processed && !inv.booked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gesamtwert</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rechnungen</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechnung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieferant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKR03 Konto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber || 'Unbekannt'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.originalName}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {invoice.supplierName || 'Unbekannt'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 'Unbekannt'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.vatRate}% MwSt.
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.skr03Account || '-'}
                      </div>
                      {invoice.bookingText && (
                        <div className="text-sm text-gray-500">
                          {invoice.bookingText}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.processed, invoice.booked)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </Link>
                      {invoice.processed && !invoice.booked && (
                        <button className="text-green-600 hover:text-green-900">
                          Buchen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {mockInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Rechnungen hochgeladen
            </h3>
            <p className="text-gray-600 mb-6">
              Laden Sie Ihre erste Rechnung hoch, um zu beginnen.
            </p>
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechnung hochladen
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
