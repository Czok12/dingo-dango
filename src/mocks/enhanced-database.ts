// Enhanced Mock Database für High-Fidelity API Simulation
import { faker } from '@faker-js/faker/locale/de';
import { InvoiceData, BookingData, UploadResult, SKR03Suggestion } from '@/services/api-client';

// Processing Status Types
export interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
}

export interface ProcessingStatus {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  current_step: string;
  steps: ProcessingStep[];
}

// Erweiterte Invoice-Daten basierend auf FRONTEND_BACKEND_INTEGRATION.md
interface EnhancedInvoiceData extends InvoiceData {
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  supplier_address?: string;
  supplier_tax_id?: string;
  currency?: string;
  extraction_errors?: string[];
  confidence_score?: number;
  skr03_account?: string;
}

// Enhanced Booking mit Invoice-Referenz
interface EnhancedBookingData extends BookingData {
  vat_amount?: number;
  invoice?: {
    supplier_name?: string;
    invoice_number?: string;
    original_name?: string;
  };
}

// Deutsche Firmen für realistische Lieferanten
const GERMAN_SUPPLIERS = [
  'Büro & Mehr GmbH',
  'TechHost Solutions AG',
  'Telekom Deutschland GmbH', 
  'Stadtwerke München',
  'Amazon Web Services EMEA',
  'Microsoft Deutschland GmbH',
  'SAP SE',
  'Siemens AG',
  'DATEV eG',
  'Deutsche Post DHL Group',
  'Allianz Versicherungs-AG',
  'Commerzbank AG',
  'ING-DiBa AG',
  'MediaMarkt Saturn Retail Group',
  'Otto Group',
  'Vodafone GmbH',
  'E.ON SE',
  'REWE Group',
  'BMW AG',
  'Volkswagen AG',
];

// SKR03 Konten-Referenz
const SKR03_ACCOUNTS = [
  { code: '6815', name: 'Sonstige betriebliche Aufwendungen', type: 'Aufwendungen', description: 'Büromaterial, Software, Kleingeräte' },
  { code: '6805', name: 'Telefon/Internet', type: 'Aufwendungen', description: 'Telekommunikationskosten' },
  { code: '6800', name: 'Porto/Versandkosten', type: 'Aufwendungen', description: 'Versand und Portokosten' },
  { code: '6820', name: 'Mieten für Einrichtungen', type: 'Aufwendungen', description: 'Büroräume, Lager' },
  { code: '6300', name: 'Löhne und Gehälter', type: 'Aufwendungen', description: 'Personalkosten' },
  { code: '6200', name: 'Raumkosten', type: 'Aufwendungen', description: 'Heizung, Strom, Wasser' },
  { code: '6400', name: 'Gesetzliche soziale Aufwendungen', type: 'Aufwendungen', description: 'Sozialversicherung' },
  { code: '6540', name: 'Reisekosten (Fahrtkosten)', type: 'Aufwendungen', description: 'Geschäftsreisen' },
  { code: '6600', name: 'Abschreibungen', type: 'Aufwendungen', description: 'Anlagegüter-Abschreibungen' },
  { code: '4400', name: 'Erlöse 19% USt', type: 'Erträge', description: 'Umsatzerlöse mit 19% MwSt' },
  { code: '4300', name: 'Erlöse 7% USt', type: 'Erträge', description: 'Umsatzerlöse mit 7% MwSt' },
  { code: '1600', name: 'Verbindlichkeiten a.LL', type: 'Verbindlichkeiten', description: 'Lieferantenverbindlichkeiten' },
  { code: '1200', name: 'Bank', type: 'Umlaufvermögen', description: 'Bankguthaben' },
  { code: '1000', name: 'Kasse', type: 'Umlaufvermögen', description: 'Kassenbestand' },
];

// Mapping für realistische SKR03-Zuordnungen basierend auf Lieferanten
const SUPPLIER_SKR03_MAPPING: Record<string, string[]> = {
  'Telekom Deutschland GmbH': ['6805'],
  'Vodafone GmbH': ['6805'],
  'TechHost Solutions AG': ['6805', '6815'],
  'Amazon Web Services EMEA': ['6815', '6805'],
  'Microsoft Deutschland GmbH': ['6815'],
  'SAP SE': ['6815'],
  'Stadtwerke München': ['6200'],
  'E.ON SE': ['6200'],
  'Deutsche Post DHL Group': ['6800'],
  'Büro & Mehr GmbH': ['6815'],
  'MediaMarkt Saturn Retail Group': ['6815'],
  'BMW AG': ['6540', '6815'],
  'Volkswagen AG': ['6540', '6815'],
  'DATEV eG': ['6815'],
  'Allianz Versicherungs-AG': ['6815'],
  'Commerzbank AG': ['6815'],
  'ING-DiBa AG': ['6815'],
  'Otto Group': ['6815'],
  'REWE Group': ['6815'],
  'Siemens AG': ['6815'],
};

export class MockDatabase {
  private static instance: MockDatabase;
  private invoices: EnhancedInvoiceData[] = [];
  private bookings: EnhancedBookingData[] = [];
  private uploads: UploadResult[] = [];

  private constructor() {
    this.initializeData();
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private initializeData() {
    // Generiere 25 realistische Rechnungen mit verschiedenen Status
    for (let i = 0; i < 25; i++) {
      const invoice = this.generateInvoice();
      this.invoices.push(invoice);
      
      // 80% der abgeschlossenen Rechnungen haben bereits Buchungen
      if (invoice.status === 'completed' && Math.random() > 0.2) {
        const booking = this.generateBookingForInvoice(invoice);
        this.bookings.push(booking);
        invoice.booked = true;
      }
    }

    // Sortiere nach Datum (neueste zuerst)
    this.invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    this.bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  private generateInvoice(): EnhancedInvoiceData {
    const supplier = faker.helpers.arrayElement(GERMAN_SUPPLIERS);
    const possibleAccounts = SUPPLIER_SKR03_MAPPING[supplier] || ['6815'];
    const accountCode = faker.helpers.arrayElement(possibleAccounts);
    const account = SKR03_ACCOUNTS.find(a => a.code === accountCode)!;
    
    const netAmount = faker.number.float({ min: 25.50, max: 3500, fractionDigits: 2 });
    const vatRate = faker.helpers.arrayElement([0, 7, 19]); // Deutsche USt-Sätze
    const vatAmount = vatRate > 0 ? Number((netAmount * (vatRate / 100)).toFixed(2)) : 0;
    const totalAmount = Number((netAmount + vatAmount).toFixed(2));
    
    const invoiceDate = faker.date.past({ years: 1 });
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const filename = `rechnung_${faker.string.alphanumeric(12)}.pdf`;
    
    // Status-Verteilung: 70% completed, 20% processing, 10% error
    const statusRandom = Math.random();
    let status: 'uploaded' | 'processing' | 'completed' | 'error';
    if (statusRandom < 0.7) status = 'completed';
    else if (statusRandom < 0.9) status = 'processing';
    else status = 'error';

    const city = faker.location.city();
    const supplierTaxId = `DE${faker.string.numeric(9)}`;

    return {
      id: faker.string.uuid(),
      filename,
      original_name: `${supplier.replace(/[^a-zA-Z0-9]/g, '_')}_${faker.date.month()}_${invoiceDate.getFullYear()}.pdf`,
      file_path: `/uploads/${invoiceDate.getFullYear()}/${String(invoiceDate.getMonth() + 1).padStart(2, '0')}/${filename}`,
      file_size: faker.number.int({ min: 150000, max: 8000000 }), // 150KB - 8MB
      mime_type: 'application/pdf',
      status,
      
      // Extracted data
      supplier_name: supplier,
      supplier_address: `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${city}`,
      supplier_tax_id: supplierTaxId,
      invoice_number: `${faker.string.alpha({ length: 2, casing: 'upper' })}-${invoiceDate.getFullYear()}-${faker.string.numeric(4)}`,
      invoice_date: invoiceDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      total_amount: totalAmount,
      net_amount: netAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      currency: 'EUR',
      
      // Processing results
      processed: status === 'completed',
      booked: false, // Wird später gesetzt
      skr03_account: accountCode,
      booking_text: this.generateBookingText(supplier, account.name),
      confidence_score: status === 'completed' ? faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 }) : undefined,
      extraction_errors: status === 'error' ? [faker.helpers.arrayElement([
        'OCR konnte Text nicht vollständig extrahieren',
        'Rechnungsdaten unvollständig oder unleserlich',
        'Datum konnte nicht eindeutig erkannt werden',
        'Betrag nicht eindeutig identifizierbar'
      ])] : [],
      
      company_id: 'default-company',
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 7 }).toISOString(),
    };
  }

  private generateBookingText(supplier: string, accountName: string): string {
    const company = supplier.split(' ')[0]; // Erstes Wort des Firmennamens
    const shortAccount = accountName.split(' ').slice(0, 2).join(' '); // Erste zwei Wörter
    return `${shortAccount} - ${company}`;
  }

  private generateBookingForInvoice(invoice: EnhancedInvoiceData): EnhancedBookingData {
    return {
      id: faker.string.uuid(),
      booking_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
      booking_text: invoice.booking_text || `Rechnung ${invoice.invoice_number}`,
      debit_account: invoice.skr03_account || '6815',
      credit_account: '1600', // Verbindlichkeiten aus Lieferungen und Leistungen
      amount: invoice.total_amount || 0,
      vat_amount: invoice.vat_amount,
      vat_rate: invoice.vat_rate,
      invoice_id: invoice.id,
      company_id: invoice.company_id,
      invoice: {
        supplier_name: invoice.supplier_name,
        invoice_number: invoice.invoice_number,
        original_name: invoice.original_name,
      },
      created_at: faker.date.recent({ days: 7 }).toISOString(),
      updated_at: faker.date.recent({ days: 7 }).toISOString(),
    };
  }

  // Public API Methods

  async uploadFile(file: File): Promise<UploadResult> {
    const uploadResult: UploadResult = {
      id: faker.string.uuid(),
      filename: `upload_${Date.now()}_${faker.string.alphanumeric(8)}.pdf`,
      original_name: file.name,
      status: 'uploaded',
      file_size: file.size,
      mime_type: file.type,
      created_at: new Date().toISOString(),
    };

    this.uploads.push(uploadResult);
    return uploadResult;
  }

  async completeProcessing(uploadId: string): Promise<void> {
    const upload = this.uploads.find(u => u.id === uploadId);
    if (!upload) return;

    // Erstelle Invoice aus Upload
    const supplier = faker.helpers.arrayElement(GERMAN_SUPPLIERS);
    const possibleAccounts = SUPPLIER_SKR03_MAPPING[supplier] || ['6815'];
    const accountCode = faker.helpers.arrayElement(possibleAccounts);
    const account = SKR03_ACCOUNTS.find(a => a.code === accountCode)!;
    
    const netAmount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });
    const vatRate = faker.helpers.arrayElement([0, 7, 19]);
    const vatAmount = vatRate > 0 ? Number((netAmount * (vatRate / 100)).toFixed(2)) : 0;
    const totalAmount = Number((netAmount + vatAmount).toFixed(2));

    const invoice: EnhancedInvoiceData = {
      id: uploadId,
      filename: upload.filename,
      original_name: upload.original_name,
      file_path: `/uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${upload.filename}`,
      file_size: upload.file_size,
      mime_type: upload.mime_type,
      status: 'completed',
      
      supplier_name: supplier,
      supplier_address: `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${faker.location.city()}`,
      supplier_tax_id: `DE${faker.string.numeric(9)}`,
      invoice_number: `${faker.string.alpha({ length: 2, casing: 'upper' })}-${new Date().getFullYear()}-${faker.string.numeric(4)}`,
      invoice_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_amount: totalAmount,
      net_amount: netAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      currency: 'EUR',
      
      processed: true,
      booked: false,
      skr03_account: accountCode,
      booking_text: this.generateBookingText(supplier, account.name),
      confidence_score: faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 }),
      extraction_errors: [],
      
      company_id: 'default-company',
      
      created_at: upload.created_at,
      updated_at: new Date().toISOString(),
    };

    this.invoices.unshift(invoice); // Am Anfang hinzufügen (neueste zuerst)
  }

  async getInvoices(params: {
    page: number;
    limit: number;
    status?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{
    invoices: EnhancedInvoiceData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    let filteredInvoices = [...this.invoices];

    // Status-Filter
    if (params.status && params.status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === params.status);
    }

    // Sortierung
    filteredInvoices.sort((a, b) => {
      let aValue: string | number = a[params.sortBy as keyof EnhancedInvoiceData] as string | number;
      let bValue: string | number = b[params.sortBy as keyof EnhancedInvoiceData] as string | number;

      if (params.sortBy === 'created_at' || params.sortBy === 'updated_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = filteredInvoices.length;
    const pages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    return {
      invoices: paginatedInvoices,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages,
      },
    };
  }

  async getInvoice(id: string): Promise<EnhancedInvoiceData | null> {
    return this.invoices.find(inv => inv.id === id) || null;
  }

  async getBookings(params: {
    page: number;
    limit: number;
    dateFrom?: string;
    dateTo?: string;
    account?: string;
  }): Promise<{
    bookings: EnhancedBookingData[];
    totals: {
      total_amount: number;
      total_vat: number;
      booking_count: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    let filteredBookings = [...this.bookings];

    // Datum-Filter
    if (params.dateFrom) {
      filteredBookings = filteredBookings.filter(b => b.booking_date >= params.dateFrom!);
    }
    if (params.dateTo) {
      filteredBookings = filteredBookings.filter(b => b.booking_date <= params.dateTo!);
    }

    // Konto-Filter
    if (params.account) {
      filteredBookings = filteredBookings.filter(b => 
        b.debit_account === params.account || b.credit_account === params.account
      );
    }

    // Totals berechnen
    const totalAmount = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalVat = filteredBookings.reduce((sum, b) => sum + (b.vat_amount || 0), 0);

    // Pagination
    const total = filteredBookings.length;
    const pages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    return {
      bookings: paginatedBookings,
      totals: {
        total_amount: Number(totalAmount.toFixed(2)),
        total_vat: Number(totalVat.toFixed(2)),
        booking_count: total,
      },
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages,
      },
    };
  }

  async getSKR03Suggestions(params: {
    text: string;
    supplier_name?: string;
    amount?: number;
  }): Promise<SKR03Suggestion[]> {
    const suggestions: SKR03Suggestion[] = [];
    
    // Intelligent matching basierend auf Text und Lieferant
    const text = params.text.toLowerCase();
    const supplierName = params.supplier_name?.toLowerCase() || '';

    // Telekom/Internet
    if (text.includes('telefon') || text.includes('internet') || text.includes('telekom') || 
        supplierName.includes('telekom') || supplierName.includes('vodafone')) {
      suggestions.push({
        account_code: '6805',
        account_name: 'Telefon/Internet',
        confidence: 0.95,
        reasoning: ['Telekommunikationskosten erkannt', 'Lieferant ist Telekom-Anbieter'],
      });
    }

    // Porto/Versand
    if (text.includes('porto') || text.includes('versand') || text.includes('dhl') ||
        supplierName.includes('post') || supplierName.includes('dhl')) {
      suggestions.push({
        account_code: '6800',
        account_name: 'Porto/Versandkosten',
        confidence: 0.92,
        reasoning: ['Versandkosten-Keywords gefunden', 'Versanddienstleister erkannt'],
      });
    }

    // Büromaterial/Software
    if (text.includes('büro') || text.includes('software') || text.includes('material') ||
        text.includes('amazon') || text.includes('microsoft')) {
      suggestions.push({
        account_code: '6815',
        account_name: 'Sonstige betriebliche Aufwendungen',
        confidence: 0.88,
        reasoning: ['Büromaterial oder Software erkannt', 'Typische Betriebsausgabe'],
      });
    }

    // Energie/Strom
    if (text.includes('strom') || text.includes('energie') || text.includes('stadtwerke') ||
        supplierName.includes('eon') || supplierName.includes('stadtwerke')) {
      suggestions.push({
        account_code: '6200',
        account_name: 'Raumkosten',
        confidence: 0.90,
        reasoning: ['Energiekosten erkannt', 'Energieversorger identifiziert'],
      });
    }

    // Fallback: Sonstige betriebliche Aufwendungen
    if (suggestions.length === 0) {
      suggestions.push({
        account_code: '6815',
        account_name: 'Sonstige betriebliche Aufwendungen',
        confidence: 0.75,
        reasoning: ['Standard-Zuordnung für betriebliche Aufwendungen'],
      });
    }

    // Limitiere auf Top 3 Vorschläge und sortiere nach Confidence
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  async createBooking(bookingData: Omit<BookingData, 'id' | 'created_at' | 'updated_at'>): Promise<EnhancedBookingData> {
    const booking: EnhancedBookingData = {
      ...bookingData,
      id: faker.string.uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Füge Invoice-Referenz hinzu, falls vorhanden
    if (bookingData.invoice_id) {
      const invoice = this.invoices.find(inv => inv.id === bookingData.invoice_id);
      if (invoice) {
        booking.invoice = {
          supplier_name: invoice.supplier_name,
          invoice_number: invoice.invoice_number,
          original_name: invoice.original_name,
        };
        // Markiere Invoice als gebucht
        invoice.booked = true;
      }
    }

    this.bookings.unshift(booking); // Am Anfang hinzufügen
    return booking;
  }
}
