import { PrismaClient } from '@prisma/client';
import { SKR03_ACCOUNTS } from '../src/lib/skr03';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Interface für Kontenplan CSV-Entry
interface KontenplanEntry {
  Konto: string;
  Bezeichnung: string;
}

// Interface für erweiterte SKR03-Account-Daten
interface ExtendedSKR03Account {
  code: string;
  name: string;
  type: string;
  category: string;
  keywords?: string;
  isCreditor?: boolean;
  isDebitor?: boolean;
}

// Interface für Kreditor CSV (falls vorhanden)
interface CreditorEntry {
  name: string;
  ustId?: string;
  iban?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  defaultAccount?: string;
  paymentTerms?: number;
  accountCode?: string;
  isFromKontenplan?: boolean;
}

/**
 * Lädt und verarbeitet Kontenplan.csv
 */
async function loadKontenplanFromCSV(): Promise<{ accounts: ExtendedSKR03Account[], creditors: CreditorEntry[] }> {
  try {
    const csvPath = path.join(process.cwd(), 'Kontenplan.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  Kontenplan.csv nicht gefunden, verwende SKR03-Standarddaten');
      return {
        accounts: SKR03_ACCOUNTS.map(account => ({
          code: account.code,
          name: account.name,
          type: account.type,
          category: account.category,
          keywords: account.keywords.join(',')
        })),
        creditors: []
      };
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    }) as KontenplanEntry[];
    
    const accounts: ExtendedSKR03Account[] = [];
    const creditors: CreditorEntry[] = [];
    
    for (const record of records) {
      // Umgang mit möglicherweise falsch geparsten Schlüsseln
      const accountCode = record.Konto || record['Konto'] || Object.values(record)[0];
      const accountName = record.Bezeichnung || record['Bezeichnung'] || Object.values(record)[1];
      
      if (!accountCode || !accountName) {
        continue;
      }
      
      // Bestimme Kontotyp und Kategorie basierend auf Kontonummer
      const { type, category, isCreditor, isDebitor } = determineAccountTypeFromCode(accountCode);
      
      // Wenn es ein Kreditorenkonto ist (70xxx)
      if (isCreditor && accountCode.startsWith('70')) {
        creditors.push({
          name: accountName,
          accountCode: accountCode,
          isFromKontenplan: true,
          defaultAccount: determineDefaultExpenseAccount(accountName),
          country: 'Deutschland'
        });
      }
      
      // Füge Konto hinzu
      accounts.push({
        code: accountCode,
        name: accountName,
        type,
        category,
        keywords: generateKeywordsFromName(accountName),
        isCreditor,
        isDebitor
      });
    }
    
    console.log(`✅ Kontenplan geladen: ${accounts.length} Konten, ${creditors.length} Kreditoren`);
    return { accounts, creditors };
    
  } catch (error) {
    console.error('Fehler beim Laden der Kontenplan CSV:', error);
    return { accounts: [], creditors: [] };
  }
}

/**
 * Bestimmt Kontotyp basierend auf SKR03-Kontonummer
 */
function determineAccountTypeFromCode(code: string): {
  type: string;
  category: string;
  isCreditor: boolean;
  isDebitor: boolean;
} {
  const numCode = parseInt(code, 10);
  
  // Spezielle Behandlung für 5-stellige Kreditor/Debitor-Konten
  if (code.length === 5) {
    if (numCode >= 10000 && numCode <= 19999) {
      return { type: 'Aktiva', category: 'Debitoren', isCreditor: false, isDebitor: true };
    }
    if (numCode >= 70000 && numCode <= 79999) {
      return { type: 'Passiva', category: 'Kreditoren', isCreditor: true, isDebitor: false };
    }
  }
  
  // Aktiva (0-1999)
  if (numCode >= 0 && numCode <= 1999) {
    if (numCode >= 1000 && numCode <= 1999) {
      // Umlaufvermögen
      if (numCode >= 1400 && numCode <= 1499) {
        return { type: 'Aktiva', category: 'Forderungen', isCreditor: false, isDebitor: true };
      }
      return { type: 'Aktiva', category: 'Umlaufvermögen', isCreditor: false, isDebitor: false };
    }
    return { type: 'Aktiva', category: 'Anlagevermögen', isCreditor: false, isDebitor: false };
  }
  
  // Passiva (2000-3999) - aber auch 1600-1899 für Verbindlichkeiten
  if ((numCode >= 1600 && numCode <= 1899) || (numCode >= 2000 && numCode <= 3999)) {
    if (numCode >= 1600 && numCode <= 1899) {
      return { type: 'Passiva', category: 'Verbindlichkeiten', isCreditor: true, isDebitor: false };
    }
    return { type: 'Passiva', category: 'Eigenkapital', isCreditor: false, isDebitor: false };
  }
  
  // Aufwand (4000-7999)
  if (numCode >= 4000 && numCode <= 7999) {
    return { type: 'Aufwand', category: determineExpenseCategory(code), isCreditor: false, isDebitor: false };
  }
  
  // Ertrag (8000-9999)
  if (numCode >= 8000 && numCode <= 9999) {
    return { type: 'Ertrag', category: 'Umsatzerlöse', isCreditor: false, isDebitor: false };
  }
  
  return { type: 'Sonstiges', category: 'Allgemein', isCreditor: false, isDebitor: false };
}

/**
 * Bestimmt Aufwandskategorie basierend auf Kontonummer
 */
function determineExpenseCategory(code: string): string {
  const numCode = parseInt(code, 10);
  
  if (numCode >= 4200 && numCode <= 4299) return 'Raumkosten';
  if (numCode >= 4300 && numCode <= 4399) return 'Steuern';
  if (numCode >= 4400 && numCode <= 4499) return 'Versicherungen';
  if (numCode >= 4500 && numCode <= 4599) return 'Fahrzeuge';
  if (numCode >= 4600 && numCode <= 4699) return 'Marketing';
  if (numCode >= 4800 && numCode <= 4899) return 'Instandhaltung';
  if (numCode >= 4900 && numCode <= 4999) return 'Büro';
  if (numCode >= 3000 && numCode <= 3999) return 'Wareneinkauf';
  if (numCode >= 4100 && numCode <= 4199) return 'Personal';
  
  return 'Sonstige Aufwendungen';
}

/**
 * Generiert Keywords aus Kontobezeichnung
 */
function generateKeywordsFromName(name: string): string {
  const keywords: string[] = [];
  const cleanName = name.toLowerCase();
  
  // Basis-Keywords aus dem Namen extrahieren
  const words = cleanName.split(/[\s\-,\/]+/);
  keywords.push(...words.filter(word => word.length > 2));
  
  // Spezielle Keywords basierend auf Begriffen
  if (cleanName.includes('miete')) keywords.push('miete', 'raumkosten');
  if (cleanName.includes('büro')) keywords.push('büro', 'büromaterial', 'office');
  if (cleanName.includes('telefon')) keywords.push('telefon', 'handy', 'kommunikation');
  if (cleanName.includes('versicherung')) keywords.push('versicherung', 'haftpflicht');
  if (cleanName.includes('kfz') || cleanName.includes('fahrzeug')) keywords.push('auto', 'fahrzeug', 'kfz');
  if (cleanName.includes('porto')) keywords.push('porto', 'versand', 'post');
  if (cleanName.includes('wartung') || cleanName.includes('reparatur')) keywords.push('wartung', 'reparatur', 'instandhaltung');
  
  return [...new Set(keywords)].join(',');
}

/**
 * Bestimmt Standard-Aufwandskonto für Kreditor
 */
function determineDefaultExpenseAccount(creditorName: string): string {
  const name = creditorName.toLowerCase();
  
  if (name.includes('finanzamt')) return '4320'; // Gewerbesteuer
  if (name.includes('handwerkskammer')) return '4380'; // Beiträge
  if (name.includes('amazon') || name.includes('galaxus')) return '4930'; // Bürobedarf
  if (name.includes('telekom') || name.includes('klarmobil')) return '4920'; // Telefon
  if (name.includes('strato')) return '4925'; // Internetkosten
  if (name.includes('db ') || name.includes('deutsche bahn')) return '4670'; // Reisekosten
  if (name.includes('haufe') || name.includes('bundesanzeiger')) return '4957'; // Abschluss- und Prüfungskosten
  
  // Standard: Sonstiger Betriebsbedarf
  return '4980';
}

/**
 * Lädt erweiterte Kreditor-Daten aus CSV (falls vorhanden)
 */
async function loadAdditionalCreditorsFromCSV(): Promise<CreditorEntry[]> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'kreditoren.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  Zusätzliche Kreditoren.csv nicht gefunden');
      return [];
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    }) as Record<string, string>[];
    
    return records.map((record: Record<string, string>) => ({
      name: record.Name || record.name,
      ustId: record.UStIdNr || record.ustId,
      iban: record.IBAN || record.iban,
      address: record.Adresse || record.address,
      city: record.Ort || record.city,
      zipCode: record.PLZ || record.zipCode,
      country: record.Land || record.country || 'Deutschland',
      defaultAccount: record.Sachkonto || record.defaultAccount,
      paymentTerms: record.Zahlungsziel ? parseInt(record.Zahlungsziel) : undefined,
      isFromKontenplan: false
    }));
    
  } catch (error) {
    console.error('Fehler beim Laden der zusätzlichen Kreditoren CSV:', error);
    return [];
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Erstelle Standard-Unternehmen
  const company = await prisma.company.upsert({
    where: { id: 'default-company-id' },
    update: {},
    create: {
      id: 'default-company-id',
      name: 'Elektro Czok UG',
      taxNumber: 'DE123456789',
      address: 'Musterstraße 123',
      city: 'Osterholz-Scharmbeck',
      zipCode: '27711'
    }
  });

  console.log('✅ Created company:', company.name);

  // Lade Kontenplan und Kreditoren aus CSV
  const { accounts, creditors: csvCreditors } = await loadKontenplanFromCSV();
  
  // Füge SKR03-Konten hinzu
  for (const account of accounts) {
    await prisma.sKR03Account.upsert({
      where: { accountCode: account.code },
      update: {},
      create: {
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        category: account.category,
        keywords: account.keywords,
        isCreditor: account.isCreditor || false,
        isDebitor: account.isDebitor || false,
        isActive: true
      }
    });
  }

  console.log(`✅ Added ${accounts.length} SKR03 accounts`);

  // Füge Kreditoren aus Kontenplan hinzu
  for (const creditorData of csvCreditors) {
    await prisma.creditor.upsert({
      where: { 
        // Fallback für eindeutige Identifikation
        ustId: creditorData.ustId || `temp-${creditorData.name}-${creditorData.accountCode}`
      },
      update: {},
      create: {
        name: creditorData.name,
        ustId: creditorData.ustId,
        iban: creditorData.iban,
        address: creditorData.address,
        city: creditorData.city,
        zipCode: creditorData.zipCode,
        country: creditorData.country,
        defaultAccount: creditorData.defaultAccount,
        creditorAccount: creditorData.accountCode,
        paymentTerms: creditorData.paymentTerms,
        isFromKontenplan: creditorData.isFromKontenplan || false,
        isActive: true
      }
    });
  }

  // Lade zusätzliche Kreditoren
  const additionalCreditors = await loadAdditionalCreditorsFromCSV();
  for (const creditorData of additionalCreditors) {
    await prisma.creditor.upsert({
      where: { ustId: creditorData.ustId || `temp-additional-${creditorData.name}` },
      update: {},
      create: {
        name: creditorData.name,
        ustId: creditorData.ustId,
        iban: creditorData.iban,
        address: creditorData.address,
        city: creditorData.city,
        zipCode: creditorData.zipCode,
        country: creditorData.country,
        defaultAccount: creditorData.defaultAccount,
        paymentTerms: creditorData.paymentTerms,
        isFromKontenplan: false,
        isActive: true
      }
    });
  }

  const totalCreditors = csvCreditors.length + additionalCreditors.length;
  console.log(`✅ Added ${totalCreditors} creditors (${csvCreditors.length} from Kontenplan, ${additionalCreditors.length} additional)`);

  // Erstelle Demo-Rechnung
  await prisma.invoice.upsert({
    where: { id: 'demo-invoice-1' },
    update: {},
    create: {
      id: 'demo-invoice-1',
      filename: 'demo_rechnung_001.pdf',
      originalName: 'Büromaterial_Rechnung_Januar.pdf',
      filePath: '/uploads/demo_rechnung_001.pdf',
      fileSize: 125000,
      mimeType: 'application/pdf',
      supplierName: 'Büro & Mehr GmbH',
      invoiceNumber: 'R-2024-001',
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-14'),
      totalAmount: 287.50,
      netAmount: 241.67,
      vatAmount: 45.83,
      vatRate: 19,
      processed: true,
      booked: false,
      skr03Account: '4930',
      bookingText: 'Büromaterial und Software',
      companyId: company.id
    }
  });

  console.log('✅ Created demo invoice');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
