import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

// Typ-Definition für Creditor (da der generierte Typ noch nicht verfügbar ist)
type CreditorType = {
  id: string;
  name: string;
  ustId: string | null;
  iban: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
  defaultAccount: string | null;
  paymentTerms: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
import { generateBookingProposal, AccountingContext, BookingProposal } from '@/lib/skr03';

const prisma = new PrismaClient();

// Interface für extrahierte Invoice-Daten
export interface ExtractedInvoiceData {
  supplierName?: string;
  supplierTaxId?: string;
  supplierAddress?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  totalAmount?: number;
  netAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  iban?: string;
  extractedText: string;
  confidence: number;
  template?: 'FAMO' | 'SONEPAR' | 'GENERIC';
}

// Interface für Regex-Pattern
interface RegexPatterns {
  ustId: RegExp[];
  iban: RegExp[];
  invoiceNumber: RegExp[];
  amounts: RegExp[];
  dates: RegExp[];
  vatRates: RegExp[];
}

// Regex-Pattern für Entity Recognition
const REGEX_PATTERNS: RegexPatterns = {
  // USt-IdNr Pattern (Deutschland und EU)
  ustId: [
    /DE\s*\d{9}/gi,
    /USt[\s\-]*Id[\s\-]*Nr[\s\.:]*([A-Z]{2}\s*\d{8,12})/gi,
    /Ust[\s\-]*ID[\s\.:]*([A-Z]{2}\s*\d{8,12})/gi,
    /VAT[\s\-]*ID[\s\.:]*([A-Z]{2}\s*\d{8,12})/gi
  ],
  
  // IBAN Pattern
  iban: [
    /IBAN[\s\.:]*([A-Z]{2}\s*\d{2}\s*[\d\s]{12,30})/gi,
    /([A-Z]{2}\d{2}[\s\d]{12,30})/g
  ],
  
  // Rechnungsnummer Pattern
  invoiceNumber: [
    /Rechnung[\s\-]*Nr[\s\.:]*([A-Z0-9\-\/]+)/gi,
    /Invoice[\s\-]*No[\s\.:]*([A-Z0-9\-\/]+)/gi,
    /Rechnungs[\s\-]*nummer[\s\.:]*([A-Z0-9\-\/]+)/gi,
    /RG[\s\-]*Nr[\s\.:]*([A-Z0-9\-\/]+)/gi
  ],
  
  // Beträge Pattern (€, EUR)
  amounts: [
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/g,
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s*EUR/g,
    /€\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g,
    /EUR\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g,
    /Summe[\s\.:]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    /Gesamtbetrag[\s\.:]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi
  ],
  
  // Datum Pattern
  dates: [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/g,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    /Datum[\s\.:]*(\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{4})/gi,
    /Rechnungsdatum[\s\.:]*(\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{4})/gi
  ],
  
  // MwSt./USt.-Sätze Pattern
  vatRates: [
    /(\d{1,2}(?:,\d{1,2})?)\s*%\s*MwSt/gi,
    /(\d{1,2}(?:,\d{1,2})?)\s*%\s*USt/gi,
    /MwSt[\s\.:]*(\d{1,2}(?:,\d{1,2})?)\s*%/gi,
    /VAT[\s\.:]*(\d{1,2}(?:,\d{1,2})?)\s*%/gi
  ]
};

/**
 * Hauptfunktion zur Verarbeitung einer Rechnung
 */
export async function processInvoice(filePath: string, invoiceId: string): Promise<ExtractedInvoiceData> {
  try {
    console.log(`Starte Verarbeitung für Datei: ${filePath}`);
    
    // Dateityp ermitteln
    const mimeType = getMimeTypeFromPath(filePath);
    let extractedText = '';
    
    // Text basierend auf Dateityp extrahieren
    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (mimeType.startsWith('image/')) {
      extractedText = await extractTextFromImage(filePath);
    } else {
      throw new Error(`Nicht unterstützter Dateityp: ${mimeType}`);
    }
    
    console.log(`Text erfolgreich extrahiert (${extractedText.length} Zeichen)`);
    
    // Entity Recognition Engine (ERE)
    const extractedData = await runEntityRecognition(extractedText);
    
    // Template Parsing Engine (TPE)
    const templateData = await runTemplateParser(extractedText);
    
    // Daten zusammenführen
    const finalData: ExtractedInvoiceData = {
      ...extractedData,
      ...templateData,
      extractedText,
      confidence: calculateConfidence(extractedData, templateData)
    };
    
    // Erweiterte Kreditor-Suche mit mehreren Kriterien
    let creditor: CreditorType | null = null;
    if (finalData.supplierTaxId || finalData.iban || finalData.supplierName) {
      creditor = await findCreditorByMultipleCriteria(
        finalData.supplierName,
        finalData.supplierTaxId,
        finalData.iban
      );
      
      // Erstelle neuen Kreditor falls nicht gefunden und genügend Daten vorhanden
      if (!creditor && finalData.supplierName) {
        creditor = await createCreditorFromInvoiceData(finalData);
      }
    }
    
    // Accounting Logic Engine - Buchungssatz-Vorschlag generieren
    let bookingProposal: BookingProposal | null = null;
    if (finalData.totalAmount && finalData.totalAmount > 0) {
      const accountingContext: AccountingContext = {
        supplierName: finalData.supplierName,
        supplierTaxId: finalData.supplierTaxId,
        creditorId: creditor?.id,
        defaultCreditorAccount: creditor?.defaultAccount || undefined,
        invoiceAmount: finalData.totalAmount,
        vatAmount: finalData.vatAmount,
        vatRate: finalData.vatRate,
        extractedText: finalData.extractedText,
        template: finalData.template
      };
      
      bookingProposal = generateBookingProposal(accountingContext);
      
      if (bookingProposal) {
        console.log(`Buchungssatz-Vorschlag: ${bookingProposal.debitAccount} an ${bookingProposal.creditAccount}, Betrag: ${bookingProposal.amount}€`);
      }
    }
    
    // Ergebnisse umfassend in Datenbank speichern
    const processingSteps = [
      `Text extrahiert: ${extractedText.length} Zeichen`,
      `Entity Recognition: ${Object.keys(extractedData).length} Felder gefunden`,
      `Template erkannt: ${templateData.template || 'GENERIC'}`,
      `Kreditor: ${creditor ? 'Gefunden' : 'Nicht gefunden'}`,
      `Buchungssatz: ${bookingProposal ? 'Erstellt' : 'Nicht erstellt'}`,
      `Vertrauenswert: ${finalData.confidence}%`
    ];
    
    const saveResult = await saveProcessingResults(invoiceId, finalData, creditor, bookingProposal, processingSteps);
    
    if (!saveResult.success) {
      throw new Error(`Speichern fehlgeschlagen: ${saveResult.message}`);
    }
    
    console.log(`✅ Verarbeitung vollständig abgeschlossen für Invoice ID: ${invoiceId}`);
    console.log(`📊 ${saveResult.message}`);
    
    return finalData;
    
  } catch (error) {
    console.error(`❌ Fehler bei der Verarbeitung von ${filePath}:`, error);
    
    // Umfassende Fehlerbehandlung und Statusaktualisierung
    try {
      // Update Invoice mit Fehlerstatus
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          processed: true,
          processingError: error instanceof Error ? error.message : 'Unbekannter Verarbeitungsfehler',
          updatedAt: new Date()
        }
      });
      
      // Update UploadedFile Status
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (invoice) {
        await updateUploadedFileStatus(
          invoice.filename, 
          'error', 
          error instanceof Error ? error.message : 'Verarbeitungsfehler'
        );
      }
      
      console.log(`❌ Fehlerstatus für Invoice ${invoiceId} in Datenbank gespeichert`);
      
    } catch (dbError) {
      console.error('❌ Zusätzlicher Fehler beim Speichern des Fehlerstatus:', dbError);
    }
    
    throw error;
  }
}

/**
 * PDF-Text-Extraktion
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(buffer);
    return pdfData.text.trim().replace(/\s+/g, ' ');
  } catch (error) {
    throw new Error(`PDF-Parsing fehlgeschlagen: ${error}`);
  }
}

/**
 * OCR für Bilddateien
 */
async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'deu', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Fortschritt: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    return text.trim().replace(/\s+/g, ' ');
  } catch (error) {
    throw new Error(`OCR fehlgeschlagen: ${error}`);
  }
}

/**
 * Entity Recognition Engine (ERE) - Extrahiert strukturierte Daten mittels Regex
 */
async function runEntityRecognition(text: string): Promise<Partial<ExtractedInvoiceData>> {
  const data: Partial<ExtractedInvoiceData> = {};
  
  try {
    // USt-IdNr extrahieren
    for (const pattern of REGEX_PATTERNS.ustId) {
      const match = pattern.exec(text);
      if (match) {
        data.supplierTaxId = match[1] || match[0];
        data.supplierTaxId = data.supplierTaxId.replace(/\s+/g, '');
        break;
      }
    }
    
    // IBAN extrahieren
    for (const pattern of REGEX_PATTERNS.iban) {
      const match = pattern.exec(text);
      if (match) {
        data.iban = (match[1] || match[0]).replace(/\s+/g, '');
        break;
      }
    }
    
    // Rechnungsnummer extrahieren
    for (const pattern of REGEX_PATTERNS.invoiceNumber) {
      const match = pattern.exec(text);
      if (match) {
        data.invoiceNumber = match[1] || match[0];
        break;
      }
    }
    
    // Beträge extrahieren
    const amounts = extractAmounts(text);
    if (amounts.length > 0) {
      // Größter Betrag ist meist der Gesamtbetrag
      data.totalAmount = Math.max(...amounts);
    }
    
    // Datum extrahieren
    const dates = extractDates(text);
    if (dates.length > 0) {
      data.invoiceDate = dates[0]; // Erstes gefundenes Datum als Rechnungsdatum
    }
    
    // MwSt.-Satz extrahieren
    const vatRates = extractVATRates(text);
    if (vatRates.length > 0) {
      data.vatRate = vatRates[0]; // Erster gefundener MwSt.-Satz
    }
    
    console.log('Entity Recognition abgeschlossen:', {
      ustId: !!data.supplierTaxId,
      iban: !!data.iban,
      invoiceNumber: !!data.invoiceNumber,
      amounts: amounts.length,
      dates: dates.length,
      vatRates: vatRates.length
    });
    
  } catch (error) {
    console.error('Fehler bei Entity Recognition:', error);
  }
  
  return data;
}

/**
 * Template Parsing Engine (TPE) - Spezifische Parser für FAMO und Sonepar
 */
async function runTemplateParser(text: string): Promise<Partial<ExtractedInvoiceData>> {
  // Template-Erkennung
  const template = detectTemplate(text);
  
  switch (template) {
    case 'FAMO':
      return parseFAMOTemplate(text);
    case 'SONEPAR':
      return parseSoneparTemplate(text);
    default:
      return parseGenericTemplate(text);
  }
}

/**
 * Template-Erkennung basierend auf charakteristischen Begriffen
 */
function detectTemplate(text: string): 'FAMO' | 'SONEPAR' | 'GENERIC' {
  const upperText = text.toUpperCase();
  
  // FAMO-spezifische Begriffe
  if (upperText.includes('FAMO') || 
      upperText.includes('FAMO GMBH') ||
      upperText.includes('FAHRZEUG-MONTAGE')) {
    return 'FAMO';
  }
  
  // Sonepar-spezifische Begriffe
  if (upperText.includes('SONEPAR') ||
      upperText.includes('ELEKTRO-GROSSHANDEL') ||
      upperText.includes('ELEKTROHANDEL')) {
    return 'SONEPAR';
  }
  
  return 'GENERIC';
}

/**
 * FAMO-spezifischer Parser
 */
async function parseFAMOTemplate(text: string): Promise<Partial<ExtractedInvoiceData>> {
  const data: Partial<ExtractedInvoiceData> = { template: 'FAMO' };
  
  try {
    // FAMO-spezifische Regex-Pattern
    const famoPatterns = {
      supplierName: /FAMO\s+GmbH/gi,
      address: /Musterstraße\s+\d+[^,]*,\s*\d{5}\s+[A-Za-z]+/gi,
      invoiceNumber: /Rechnung\s+Nr\.\s*([RF]\d{6,8})/gi,
      serviceDescription: /Fahrzeugmontage|Wartung|Reparatur/gi
    };
    
    // Lieferantenname
    const supplierMatch = famoPatterns.supplierName.exec(text);
    if (supplierMatch) {
      data.supplierName = 'FAMO GmbH';
    }
    
    // Rechnungsnummer (FAMO-spezifisches Format)
    const invoiceMatch = famoPatterns.invoiceNumber.exec(text);
    if (invoiceMatch) {
      data.invoiceNumber = invoiceMatch[1];
    }
    
    console.log('FAMO-Template-Parsing abgeschlossen');
    
  } catch (error) {
    console.error('Fehler beim FAMO-Template-Parsing:', error);
  }
  
  return data;
}

/**
 * Sonepar-spezifischer Parser
 */
async function parseSoneparTemplate(text: string): Promise<Partial<ExtractedInvoiceData>> {
  const data: Partial<ExtractedInvoiceData> = { template: 'SONEPAR' };
  
  try {
    // Sonepar-spezifische Regex-Pattern
    const sonepatterns = {
      supplierName: /Sonepar\s+[A-Z][a-z]+/gi,
      invoiceNumber: /RE\s*-\s*(\d{8,10})/gi,
      articleNumbers: /Art\.\s*Nr\.\s*(\d{6,8})/gi
    };
    
    // Lieferantenname
    const supplierMatch = sonepatterns.supplierName.exec(text);
    if (supplierMatch) {
      data.supplierName = supplierMatch[0];
    }
    
    // Rechnungsnummer (Sonepar-spezifisches Format)
    const invoiceMatch = sonepatterns.invoiceNumber.exec(text);
    if (invoiceMatch) {
      data.invoiceNumber = invoiceMatch[1];
    }
    
    console.log('Sonepar-Template-Parsing abgeschlossen');
    
  } catch (error) {
    console.error('Fehler beim Sonepar-Template-Parsing:', error);
  }
  
  return data;
}

/**
 * Generischer Parser für unbekannte Templates
 */
async function parseGenericTemplate(text: string): Promise<Partial<ExtractedInvoiceData>> {
  const data: Partial<ExtractedInvoiceData> = { template: 'GENERIC' };
  
  try {
    // Versuche Lieferantennamen aus Kopfzeilen zu extrahieren
    const lines = text.split('\n');
    const firstLines = lines.slice(0, 10);
    
    for (const line of firstLines) {
      if (line.trim().length > 0 && 
          line.includes('GmbH') || 
          line.includes('AG') || 
          line.includes('KG') ||
          line.includes('e.K.')) {
        data.supplierName = line.trim();
        break;
      }
    }
    
    console.log('Generisches Template-Parsing abgeschlossen');
    
  } catch (error) {
    console.error('Fehler beim generischen Template-Parsing:', error);
  }
  
  return data;
}

/**
 * Hilfsfunktionen für Datenextraktion
 */

function extractAmounts(text: string): number[] {
  const amounts: number[] = [];
  
  for (const pattern of REGEX_PATTERNS.amounts) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const cleanAmount = match[1].replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(cleanAmount);
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount);
      }
    }
  }
  
  return [...new Set(amounts)]; // Duplikate entfernen
}

function extractDates(text: string): Date[] {
  const dates: Date[] = [];
  
  for (const pattern of REGEX_PATTERNS.dates) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[1] || match[0];
      const date = parseGermanDate(dateStr);
      if (date && !isNaN(date.getTime())) {
        dates.push(date);
      }
    }
  }
  
  return dates;
}

function extractVATRates(text: string): number[] {
  const rates: number[] = [];
  
  for (const pattern of REGEX_PATTERNS.vatRates) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const rateStr = match[1].replace(',', '.');
      const rate = parseFloat(rateStr);
      if (!isNaN(rate) && rate >= 0 && rate <= 25) {
        rates.push(rate);
      }
    }
  }
  
  return [...new Set(rates)]; // Duplikate entfernen
}

function parseGermanDate(dateStr: string): Date | null {
  // DD.MM.YYYY Format
  const match = dateStr.match(/(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript Monate sind 0-basiert
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  return null;
}

function getMimeTypeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function calculateConfidence(ereData: Partial<ExtractedInvoiceData>, templateData: Partial<ExtractedInvoiceData>): number {
  let score = 0;
  let maxScore = 0;
  
  // Bewerte verschiedene Datenfelder
  const fields = ['supplierTaxId', 'iban', 'invoiceNumber', 'totalAmount', 'invoiceDate'];
  
  for (const field of fields) {
    maxScore += 20;
    if (ereData[field as keyof ExtractedInvoiceData] || templateData[field as keyof ExtractedInvoiceData]) {
      score += 20;
    }
  }
  
  // Bonus für Template-Erkennung
  if (templateData.template && templateData.template !== 'GENERIC') {
    score += 20;
    maxScore += 20;
  }
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

async function updateInvoiceWithExtractedData(
  invoiceId: string, 
  data: ExtractedInvoiceData,
  creditor?: CreditorType | null,
  bookingProposal?: BookingProposal | null
): Promise<void> {
  try {
    // Update invoice with all extracted data and mark as completed
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        supplierName: data.supplierName,
        supplierTaxId: data.supplierTaxId,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        totalAmount: data.totalAmount,
        netAmount: data.netAmount,
        vatAmount: data.vatAmount,
        vatRate: data.vatRate,
        ocrText: data.extractedText,
        processed: true,
        processingError: null,
        creditorId: creditor?.id,
        skr03Account: bookingProposal?.debitAccount,
        bookingText: bookingProposal?.bookingText,
        updatedAt: new Date()
      }
    });
    
    // Erstelle Buchungssatz-Vorschlag in separater Tabelle
    if (bookingProposal && updatedInvoice) {
      await createBookingEntry(invoiceId, bookingProposal);
    }
    
    // Log successful completion with detailed information
    console.log(`✅ Invoice ${invoiceId} erfolgreich verarbeitet und gespeichert:`);
    console.log(`   - Lieferant: ${data.supplierName || 'N/A'}`);
    console.log(`   - Rechnungsnummer: ${data.invoiceNumber || 'N/A'}`);
    console.log(`   - Betrag: ${data.totalAmount ? data.totalAmount.toFixed(2) + '€' : 'N/A'}`);
    console.log(`   - Kreditor: ${creditor?.name || 'Nicht gefunden'}`);
    console.log(`   - Buchungssatz: ${bookingProposal ? `${bookingProposal.debitAccount} an ${bookingProposal.creditAccount}` : 'Nicht erstellt'}`);
    console.log(`   - Vertrauenswert: ${data.confidence}%`);
    
    // Update corresponding UploadedFile status if exists
    await updateUploadedFileStatus(updatedInvoice.filename, 'completed', null);
    
  } catch (error) {
    console.error(`❌ Fehler beim Aktualisieren der Invoice ${invoiceId}:`, error);
    
    // Try to update with error status
    try {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          processed: true,
          processingError: error instanceof Error ? error.message : 'Unbekannter Datenbankfehler',
          updatedAt: new Date()
        }
      });
      
      // Update corresponding UploadedFile status
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (invoice) {
        await updateUploadedFileStatus(invoice.filename, 'error', error instanceof Error ? error.message : 'Datenbankfehler');
      }
    } catch (updateError) {
      console.error('Fehler beim Speichern des Fehlerstatus:', updateError);
    }
    
    throw error;
  }
}

/**
 * Aktualisiert den Status einer hochgeladenen Datei
 */
async function updateUploadedFileStatus(
  filename: string, 
  status: 'processing' | 'completed' | 'error',
  errorMessage?: string | null
): Promise<void> {
  try {
    await prisma.uploadedFile.updateMany({
      where: { filename },
      data: {
        status,
        ...(errorMessage && { extractedText: errorMessage }),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des UploadedFile-Status für ${filename}:`, error);
    // Nicht kritisch - Verarbeitung fortsetzen
  }
}

/**
 * Erstellt einen Buchungssatz-Eintrag mit umfassenden Daten
 */
async function createBookingEntry(
  invoiceId: string, 
  proposal: BookingProposal
): Promise<void> {
  try {
    // Hole die Invoice-Daten für zusätzliche Informationen
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { creditor: true }
    });
    
    if (!invoice) {
      throw new Error(`Invoice mit ID ${invoiceId} nicht gefunden`);
    }
    
    const bookingEntry = await prisma.booking.create({
      data: {
        bookingDate: new Date(),
        bookingText: proposal.bookingText,
        debitAccount: proposal.debitAccount,
        creditAccount: proposal.creditAccount,
        amount: proposal.amount,
        vatRate: proposal.vatRate,
        invoiceId: invoiceId,
        companyId: invoice.companyId,
      }
    });
    
    console.log(`✅ Buchungssatz erstellt: ${proposal.debitAccount} an ${proposal.creditAccount}, Betrag: ${proposal.amount.toFixed(2)}€`);
    console.log(`   - Buchungstext: ${proposal.bookingText}`);
    console.log(`   - MwSt.-Satz: ${proposal.vatRate || 0}%`);
    console.log(`   - Buchung-ID: ${bookingEntry.id}`);
    
    // Return void as specified in function signature
    
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Buchungssatzes:', error);
    // Nicht kritisch - Verarbeitung fortsetzen, aber Fehler loggen
    throw new Error(`Buchungssatz-Erstellung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

/**
 * Speichert alle Verarbeitungsschritte und Ergebnisse in der Datenbank
 */
export async function saveProcessingResults(
  invoiceId: string,
  data: ExtractedInvoiceData,
  creditor?: CreditorType | null,
  bookingProposal?: BookingProposal | null,
  processingSteps?: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    // Speichere die Hauptdaten
    await updateInvoiceWithExtractedData(invoiceId, data, creditor, bookingProposal);
    
    // Optional: Speichere Verarbeitungsschritte als Notizen
    if (processingSteps && processingSteps.length > 0) {
      const processingLog = processingSteps.join('\n');
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          processingError: processingLog // Zweckentfremdung des Felds für Verarbeitungslog
        }
      });
    }
    
    // Erstelle Zusammenfassung der gespeicherten Daten
    const summary = {
      invoiceId,
      supplierName: data.supplierName || 'N/A',
      invoiceNumber: data.invoiceNumber || 'N/A',
      totalAmount: data.totalAmount || 0,
      creditorFound: !!creditor,
      bookingProposalCreated: !!bookingProposal,
      confidence: data.confidence || 0
    };
    
    console.log('💾 Alle Verarbeitungsergebnisse erfolgreich in Datenbank gespeichert:', summary);
    
    return {
      success: true,
      message: `Rechnung erfolgreich verarbeitet und gespeichert. Vertrauenswert: ${data.confidence}%`
    };
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Verarbeitungsergebnisse:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unbekannter Fehler beim Speichern'
    };
  }
}

/**
 * Kreditor-Management-Funktionen
 */

/**
 * Sucht einen Kreditor anhand der USt-IdNr mit erweiterten Suchkriterien
 */
export async function findCreditorByUStId(ustId: string): Promise<CreditorType | null> {
  try {
    if (!ustId || ustId.trim() === '') {
      return null;
    }
    
    // Bereinige die USt-IdNr (entferne Leerzeichen und Sonderzeichen)
    const cleanUstId = ustId.replace(/[\s\-\.]/g, '').toUpperCase();
    
    // Primäre Suche: Exakte USt-IdNr
    const creditor = await prisma.creditor.findFirst({
      where: {
        ustId: {
          equals: cleanUstId
        },
        isActive: true
      }
    });
    
    if (creditor) {
      console.log(`✅ Kreditor gefunden (USt-IdNr): ${creditor.name} (${creditor.ustId})`);
      return creditor;
    }
    
    // Fallback-Suche: Ähnliche USt-IdNr (für Tippfehler oder Formatierungsunterschiede)
    const similarCreditors = await prisma.creditor.findMany({
      where: {
        ustId: {
          contains: cleanUstId.substring(0, 8)
        },
        isActive: true
      }
    });
    
    if (similarCreditors.length > 0) {
      // Wähle den besten Match basierend auf Ähnlichkeit
      const bestMatch = similarCreditors.find((c: CreditorType) => 
        c.ustId && c.ustId.replace(/[\s\-\.]/g, '').toUpperCase().includes(cleanUstId.substring(0, 10))
      );
      
      if (bestMatch) {
        console.log(`⚠️ Ähnlicher Kreditor gefunden: ${bestMatch.name} (${bestMatch.ustId})`);
        return bestMatch;
      }
    }
    
    console.log(`❌ Kein Kreditor für USt-IdNr ${cleanUstId} gefunden`);
    return null;
    
  } catch (error) {
    console.error('Fehler beim Suchen des Kreditors:', error);
    return null;
  }
}

/**
 * Erweiterte Kreditor-Suche mit mehreren Kriterien
 */
export async function findCreditorByMultipleCriteria(
  supplierName?: string,
  ustId?: string,
  iban?: string
): Promise<CreditorType | null> {
  try {
    // 1. Priorität: USt-IdNr
    if (ustId) {
      const creditorByUstId = await findCreditorByUStId(ustId);
      if (creditorByUstId) {
        return creditorByUstId;
      }
    }
    
    // 2. Priorität: IBAN
    if (iban) {
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      const creditorByIban = await prisma.creditor.findFirst({
        where: {
          iban: {
            equals: cleanIban
          },
          isActive: true
        }
      });
      
      if (creditorByIban) {
        console.log(`✅ Kreditor gefunden (IBAN): ${creditorByIban.name}`);
        return creditorByIban;
      }
    }
    
    // 3. Priorität: Name (Fuzzy-Suche)
    if (supplierName) {
      const creditorByName = await findCreditorByName(supplierName);
      if (creditorByName) {
        return creditorByName;
      }
    }
    
    console.log('❌ Kreditor mit den gegebenen Kriterien nicht gefunden');
    return null;
    
  } catch (error) {
    console.error('Fehler bei der erweiterten Kreditor-Suche:', error);
    return null;
  }
}

/**
 * Sucht Kreditor anhand des Namens mit Fuzzy-Matching
 */
export async function findCreditorByName(supplierName: string): Promise<CreditorType | null> {
  try {
    if (!supplierName || supplierName.trim() === '') {
      return null;
    }
    
    const cleanName = supplierName.trim();
    
    // Exakte Suche
    const creditor = await prisma.creditor.findFirst({
      where: {
        name: {
          equals: cleanName
        },
        isActive: true
      }
    });
    
    if (creditor) {
      console.log(`✅ Kreditor gefunden (exakter Name): ${creditor.name}`);
      return creditor;
    }
    
    // Fuzzy-Suche: Enthält-Suche
    const partialMatches = await prisma.creditor.findMany({
      where: {
        name: {
          contains: cleanName
        },
        isActive: true
      }
    });
    
    if (partialMatches.length > 0) {
      // Bevorzuge den kürzesten Namen (wahrscheinlich bester Match)
      partialMatches.sort((a: CreditorType, b: CreditorType) => a.name.length - b.name.length);
      console.log(`⚠️ Ähnlicher Kreditor gefunden: ${partialMatches[0].name}`);
      return partialMatches[0];
    }
    
    // Erweiterte Fuzzy-Suche: Einzelne Wörter
    const words = cleanName.split(/\s+/).filter(word => word.length > 2);
    if (words.length > 0) {
      for (const word of words) {
        const wordMatches = await prisma.creditor.findMany({
          where: {
            name: {
              contains: word
            },
            isActive: true
          }
        });
        
        if (wordMatches.length > 0) {
          console.log(`⚠️ Kreditor gefunden (Wort-Match "${word}"): ${wordMatches[0].name}`);
          return wordMatches[0];
        }
      }
    }
    
    console.log(`❌ Kein Kreditor für Name "${cleanName}" gefunden`);
    return null;
    
  } catch (error) {
    console.error('Fehler bei der Name-basierten Kreditor-Suche:', error);
    return null;
  }
}

/**
 * Erstellt einen neuen Kreditor basierend auf extrahierten Daten
 */
export async function createCreditorFromInvoiceData(
  invoiceData: ExtractedInvoiceData
): Promise<CreditorType | null> {
  try {
    if (!invoiceData.supplierName) {
      console.log('Kein Lieferantenname verfügbar, Kreditor-Erstellung übersprungen');
      return null;
    }
    
    const creditorData = {
      name: invoiceData.supplierName,
      ustId: invoiceData.supplierTaxId,
      iban: invoiceData.iban,
      isActive: true,
      notes: `Automatisch erstellt aus Rechnung am ${new Date().toLocaleDateString()}`
    };
    
    const newCreditor = await prisma.creditor.create({
      data: creditorData
    });
    
    console.log(`✅ Neuer Kreditor erstellt: ${newCreditor.name}`);
    return newCreditor;
    
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Kreditors:', error);
    return null;
  }
}
