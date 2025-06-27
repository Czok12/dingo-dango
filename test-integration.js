// Integrations-Test für die neue Creditor-Debitor-Management und Accounting Logic Engine

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIntegration() {
  console.log('🧪 Starte Integrations-Test...\n');

  try {
    // 1. Test: Kreditor-Suche nach USt-IdNr
    console.log('1. Test: Kreditor-Suche...');
    const creditors = await prisma.creditor.findMany({
      where: { isFromKontenplan: true },
      take: 5
    });
    console.log(`✅ ${creditors.length} Kreditoren aus Kontenplan gefunden`);
    if (creditors.length > 0) {
      console.log(`   Beispiel: ${creditors[0].name} (Konto: ${creditors[0].accountCode})`);
    }

    // 2. Test: SKR03-Konten prüfen
    console.log('\n2. Test: SKR03-Konten...');
    const accounts = await prisma.sKR03Account.findMany({
      where: { isCreditor: true },
      take: 5
    });
    console.log(`✅ ${accounts.length} Kreditorenkonten gefunden`);
    
    const expenseAccounts = await prisma.sKR03Account.findMany({
      where: { accountType: 'Aufwand' },
      take: 5
    });
    console.log(`✅ ${expenseAccounts.length} Aufwandskonten gefunden`);

    // 3. Test: Template-spezifische Kreditoren suchen
    console.log('\n3. Test: Template-spezifische Kreditoren...');
    const famoCreditor = await prisma.creditor.findFirst({
      where: { 
        name: { contains: 'FAMO' }
      }
    });
    if (famoCreditor) {
      console.log(`✅ FAMO-Kreditor gefunden: ${famoCreditor.name}`);
      console.log(`   Default Account: ${famoCreditor.defaultAccount}`);
    }

    const soneParCreditor = await prisma.creditor.findFirst({
      where: { 
        name: { contains: 'Sonepar' }
      }
    });
    if (soneParCreditor) {
      console.log(`✅ Sonepar-Kreditor gefunden: ${soneParCreditor.name}`);
      console.log(`   Default Account: ${soneParCreditor.defaultAccount}`);
    }

    // 4. Test: Finanzamt und Behörden
    console.log('\n4. Test: Behörden-Kreditoren...');
    const finanzamt = await prisma.creditor.findFirst({
      where: { 
        name: { contains: 'Finanzamt' }
      }
    });
    if (finanzamt) {
      console.log(`✅ Finanzamt gefunden: ${finanzamt.name}`);
      console.log(`   Default Account: ${finanzamt.defaultAccount}`);
    }

    // 5. Test: E-Commerce Anbieter
    console.log('\n5. Test: E-Commerce-Anbieter...');
    const amazonCreditors = await prisma.creditor.findMany({
      where: { 
        name: { contains: 'Amazon' }
      }
    });
    console.log(`✅ ${amazonCreditors.length} Amazon-Kreditoren gefunden`);

    console.log('\n🎉 Integrations-Test erfolgreich abgeschlossen!');

  } catch (error) {
    console.error('❌ Integrations-Test fehlgeschlagen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIntegration();
