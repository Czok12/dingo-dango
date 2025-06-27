// Korrigierte Mock-Datenbank mit richtigen TypeScript-Interfaces
import { faker } from '@faker-js/faker/locale/de';
import { InvoiceData, BookingData, UploadResult } from '@/services/api-client';

// TypeScript-Interfaces für Mock-API-Responses
interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface BookingTotals {
  total_amount: number;
  total_vat: number;
  booking_count: number;
}

interface InvoicesResponse {
  invoices: InvoiceData[];
  pagination: PaginationResult;
}

interface BookingsResponse {
  bookings: BookingData[];
  totals: BookingTotals;
  pagination: PaginationResult;
}

interface UploadResponse {
  results: UploadResult[];
}

// Deutsche Firmen für realistische Lieferanten
const GERMAN_SUPPLIERS = [
  'Büro & Mehr GmbH',
  'TechHost Solutions',
  'Telekom Deutschland GmbH',
  'Stadtwerke München',
  'Amazon Web Services',
  'Microsoft Deutschland',
  'SAP SE',
  'Siemens AG',
  'DATEV eG',
  'Deutsche Post DHL',
  'Allianz Versicherung',
  'Commerzbank AG',
  'ING-DiBa AG',
  'MediaMarkt Saturn',
  'Otto Group',
];

// SKR03-Konten für realistische Buchungen
const SKR03_ACCOUNTS = [
  { code: '6815', name: 'Sonstige betriebliche Aufwendungen', type: 'Aufwendungen' },
  { code: '6805', name: 'Telefon/Internet', type: 'Aufwendungen' },
  { code: '6800', name: 'Porto/Versandkosten', type: 'Aufwendungen' },
  { code: '6820', name: 'Mieten für Einrichtungen', type: 'Aufwendungen' },
  { code: '4400', name: 'Erlöse 19% USt', type: 'Erträge' },
  { code: '1600', name: 'Verbindlichkeiten a.LL', type: 'Verbindlichkeiten' },
  { code: '1200', name: 'Bank', type: 'Umlaufvermögen' },
];

// Mock-Datenbank als Singleton
class MockDatabase {
  private static instance: MockDatabase;
  private invoices: InvoiceData[] = [];
  private bookings: BookingData[] = [];
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
    // Generiere 20 realistische Rechnungen
    for (let i = 0; i < 20; i++) {
      const invoice = this.generateInvoice();
      this.invoices.push(invoice);
      
      // 70% der Rechnungen haben bereits Buchungen
      if (Math.random() > 0.3) {
        const booking = this.generateBookingForInvoice(invoice);
        this.bookings.push(booking);
      }
    }

    // Sortiere nach Datum (neueste zuerst)
    this.invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    this.bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  private generateInvoice(): InvoiceData {
    const supplier = faker.helpers.arrayElement(GERMAN_SUPPLIERS);
    const account = faker.helpers.arrayElement(SKR03_ACCOUNTS.filter(a => a.type === 'Aufwendungen'));
    const netAmount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });
    const vatRate = faker.helpers.arrayElement([0, 7, 19]); // Deutsche USt-Sätze
    const vatAmount = vatRate > 0 ? Number((netAmount * (vatRate / 100)).toFixed(2)) : 0;
    const totalAmount = netAmount + vatAmount;
    
    const invoiceDate = faker.date.past({ years: 1 });
    const filename = `rechnung_${faker.string.alphanumeric(8)}.pdf`;
    const companyId = 'demo-company-id';
    
    return {
      id: faker.string.uuid(),
      filename,
      original_name: `${supplier.replace(/[^a-zA-Z0-9]/g, '_')}_${faker.date.month()}_${invoiceDate.getFullYear()}.pdf`,
      file_path: `/uploads/${invoiceDate.getFullYear()}/${String(invoiceDate.getMonth() + 1).padStart(2, '0')}/${filename}`,
      file_size: faker.number.int({ min: 100000, max: 5000000 }), // 100KB - 5MB
      mime_type: 'application/pdf',
      
      // Extracted data
      supplier_name: supplier,
      supplier_tax_id: `DE${faker.string.numeric(9)}`,
      invoice_number: `${faker.string.alpha({ length: 2, casing: 'upper' })}-${invoiceDate.getFullYear()}-${faker.string.numeric(3)}`,
      invoice_date: invoiceDate.toISOString().split('T')[0],
      due_date: faker.date.future({ years: 0.1, refDate: invoiceDate }).toISOString().split('T')[0],
      total_amount: totalAmount,
      net_amount: netAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      
      // Processing status
      ocr_text: faker.lorem.paragraphs(3),
      processed: true,
      processing_error: Math.random() > 0.9 ? faker.lorem.sentence() : undefined,
      ocr_confidence: faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
      
      // Booking information
      booked: Math.random() > 0.3, // 70% sind bereits gebucht
      suggested_account: account.code,
      booking_text: this.generateBookingText(supplier, account),
      suggestion_confidence: faker.number.float({ min: 0.8, max: 0.98, fractionDigits: 2 }),
      
      company_id: companyId,
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };
  }

  private generateBookingText(supplier: string, account: { name: string }): string {
    const company = supplier.split(' ')[0]; // Erstes Wort des Firmennamens
    return `${account.name} - ${company}`;
  }

  private generateBookingForInvoice(invoice: InvoiceData): BookingData {
    return {
      id: faker.string.uuid(),
      booking_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
      booking_text: invoice.booking_text || `Rechnung ${invoice.invoice_number}`,
      debit_account: invoice.suggested_account || '6815',
      credit_account: '1600', // Verbindlichkeiten
      amount: invoice.total_amount || 0,
      vat_rate: invoice.vat_rate,
      invoice_id: invoice.id,
      company_id: invoice.company_id,
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };
  }

  // CRUD-Methoden für Mock-API
  getInvoices(page: number = 1, limit: number = 50): InvoicesResponse {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedInvoices = this.invoices.slice(start, end);
    
    return {
      invoices: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: this.invoices.length,
        pages: Math.ceil(this.invoices.length / limit),
      },
    };
  }

  getBookings(page: number = 1, limit: number = 50): BookingsResponse {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBookings = this.bookings.slice(start, end);
    
    const totalAmount = this.bookings.reduce((sum, booking) => sum + booking.amount, 0);
    const totalVat = this.bookings.reduce((sum, booking) => {
      if (booking.vat_rate && booking.amount) {
        return sum + (booking.amount * booking.vat_rate / (100 + booking.vat_rate));
      }
      return sum;
    }, 0);
    
    return {
      bookings: paginatedBookings,
      totals: {
        total_amount: totalAmount,
        total_vat: totalVat,
        booking_count: this.bookings.length,
      },
      pagination: {
        page,
        limit,
        total: this.bookings.length,
        pages: Math.ceil(this.bookings.length / limit),
      },
    };
  }

  addUpload(files: File[]): UploadResponse {
    const results = files.map(file => {
      const upload: UploadResult = {
        id: faker.string.uuid(),
        filename: `upload_${Date.now()}_${faker.string.alphanumeric(6)}.pdf`,
        original_name: file.name,
        status: 'uploaded',
        file_size: file.size,
        mime_type: file.type,
        created_at: new Date().toISOString(),
      };
      
      this.uploads.push(upload);
      
      // Simuliere Verarbeitung: Nach Upload automatisch Invoice erstellen
      setTimeout(() => {
        const invoice = this.createInvoiceFromUpload(upload);
        this.invoices.unshift(invoice); // Am Anfang hinzufügen (neueste zuerst)
        
        // Simuliere Buchung nach weiteren 2 Sekunden
        setTimeout(() => {
          const booking = this.generateBookingForInvoice(invoice);
          this.bookings.unshift(booking);
        }, 2000);
      }, 1000);
      
      return upload;
    });
    
    return { results };
  }

  private createInvoiceFromUpload(upload: UploadResult): InvoiceData {
    const supplier = faker.helpers.arrayElement(GERMAN_SUPPLIERS);
    const account = faker.helpers.arrayElement(SKR03_ACCOUNTS.filter(a => a.type === 'Aufwendungen'));
    const netAmount = faker.number.float({ min: 50, max: 2000, fractionDigits: 2 });
    const vatRate = faker.helpers.arrayElement([0, 7, 19]);
    const vatAmount = vatRate > 0 ? Number((netAmount * (vatRate / 100)).toFixed(2)) : 0;
    const totalAmount = netAmount + vatAmount;
    
    return {
      id: faker.string.uuid(),
      filename: upload.filename,
      original_name: upload.original_name,
      file_path: `/uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${upload.filename}`,
      file_size: upload.file_size,
      mime_type: upload.mime_type,
      
      supplier_name: supplier,
      supplier_tax_id: `DE${faker.string.numeric(9)}`,
      invoice_number: `${faker.string.alpha({ length: 2, casing: 'upper' })}-${new Date().getFullYear()}-${faker.string.numeric(3)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: faker.date.future({ years: 0.1 }).toISOString().split('T')[0],
      total_amount: totalAmount,
      net_amount: netAmount,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      
      ocr_text: faker.lorem.paragraphs(2),
      processed: true,
      ocr_confidence: faker.number.float({ min: 0.85, max: 0.98, fractionDigits: 2 }),
      
      booked: false, // Neu hochgeladene Rechnungen sind noch nicht gebucht
      suggested_account: account.code,
      booking_text: this.generateBookingText(supplier, account),
      suggestion_confidence: faker.number.float({ min: 0.85, max: 0.95, fractionDigits: 2 }),
      
      company_id: 'demo-company-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Utility-Methoden für erweiterte Mock-Features
  getInvoiceById(id: string): InvoiceData | undefined {
    return this.invoices.find(invoice => invoice.id === id);
  }

  updateInvoiceBookingStatus(id: string, booked: boolean): boolean {
    const invoice = this.invoices.find(inv => inv.id === id);
    if (invoice) {
      invoice.booked = booked;
      invoice.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index > -1) {
      this.invoices.splice(index, 1);
      // Auch zugehörige Buchungen löschen
      this.bookings = this.bookings.filter(booking => booking.invoice_id !== id);
      return true;
    }
    return false;
  }
}

export default MockDatabase;
