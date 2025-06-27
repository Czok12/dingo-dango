import { PrismaClient } from '@prisma/client';
import { SKR03_ACCOUNTS } from '../src/lib/skr03';

const prisma = new PrismaClient();

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

  // Füge SKR03-Konten hinzu
  for (const account of SKR03_ACCOUNTS) {
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

  console.log(`✅ Added ${SKR03_ACCOUNTS.length} SKR03 accounts`);

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
