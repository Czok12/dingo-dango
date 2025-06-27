import { PrismaClient } from '@prisma/client';
import { SKR03_ACCOUNTS } from '../src/lib/skr03';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Interface für Kontenplan CSV
interface KontenplanEntry {
  code: string;
  name: string;
  type: string;
  category: string;
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
}

async function loadKontenplanFromCSV(): Promise<KontenplanEntry[]> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'kontenplan.csv');
    
    // Fallback: Verwende die bestehenden SKR03-Daten falls CSV nicht vorhanden
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  Kontenplan.csv nicht gefunden, verwende SKR03-Standarddaten');
      return SKR03_ACCOUNTS.map(account => ({
        code: account.code,
        name: account.name,
        type: account.type,
        category: account.category
      }));
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';' // Annahme: deutsche CSV mit Semikolon
    }) as Record<string, string>[];
    
    return records.map((record: Record<string, string>) => ({
      code: record.Kontonummer || record.code,
      name: record.Kontobezeichnung || record.name,
      type: record.Kontotyp || record.type || 'Aufwand',
      category: record.Kategorie || record.category || 'Allgemein'
    }));
    
  } catch (error) {
    console.error('Fehler beim Laden der Kontenplan CSV:', error);
    return [];
  }
}

async function loadCreditorsFromCSV(): Promise<CreditorEntry[]> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'kreditoren.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  Kreditoren.csv nicht gefunden, erstelle Demo-Kreditoren');
      return [
        {
          name: 'FAMO GmbH',
          ustId: 'DE123456789',
          iban: 'DE89370400440532013000',
          address: 'Industriestraße 15',
          city: 'München',
          zipCode: '80331',
          country: 'Deutschland',
          defaultAccount: '4400',
          paymentTerms: 30
        },
        {
          name: 'Sonepar Deutschland GmbH',
          ustId: 'DE987654321',
          iban: 'DE12500105170137075030',
          address: 'Am Wallgraben 100',
          city: 'Stuttgart',
          zipCode: '70565',
          country: 'Deutschland',
          defaultAccount: '4300',
          paymentTerms: 14
        }
      ];
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
      paymentTerms: record.Zahlungsziel ? parseInt(record.Zahlungsziel) : undefined
    }));
    
  } catch (error) {
    console.error('Fehler beim Laden der Kreditoren CSV:', error);
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
      name: 'Mustermann Elektrotechnik UG',
      taxNumber: 'DE123456789',
      address: 'Musterstraße 123',
      city: 'Berlin',
      zipCode: '10115'
    }
  });

  console.log('✅ Created company:', company.name);

  // Lade und füge Kontenplan hinzu
  const kontenplan = await loadKontenplanFromCSV();
  for (const account of kontenplan) {
    await prisma.sKR03Account.upsert({
      where: { accountCode: account.code },
      update: {},
      create: {
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        category: account.category,
        isActive: true
      }
    });
  }

  console.log(`✅ Added ${kontenplan.length} SKR03 accounts`);

  // Lade und füge Kreditoren hinzu
  const creditors = await loadCreditorsFromCSV();
  for (const creditorData of creditors) {
    await prisma.creditor.upsert({
      where: { ustId: creditorData.ustId || `temp-${creditorData.name}` },
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
        isActive: true
      }
    });
  }

  console.log(`✅ Added ${creditors.length} creditors`);

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
      skr03Account: '6815',
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
