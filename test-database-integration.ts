/**
 * Test-Datei für die Integration der Datenbankfunktionalität
 * Diese Datei testet das Speichern von Verarbeitungsergebnissen in der Datenbank
 */

import { PrismaClient } from '@prisma/client';
import { saveProcessingResults } from './src/services/processing-service';
import type { ExtractedInvoiceData } from './src/services/processing-service';

const prisma = new PrismaClient();

async function testDatabaseIntegration() {
  console.log('🧪 Starte Test der Datenbank-Integration...\n');
  
  try {
    // 1. Erstelle eine Test-Company falls nicht vorhanden
    console.log('1. Überprüfe Test-Company...');
    let company = await prisma.company.findFirst({
      where: { name: 'Test Company' }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Test Company',
          taxNumber: 'DE123456789',
          address: 'Teststraße 123',
          city: 'Teststadt',
          zipCode: '12345'
        }
      });
      console.log('✅ Test-Company erstellt');
    } else {
      console.log('✅ Test-Company bereits vorhanden');
    }
    
    // 2. Erstelle eine Test-Invoice
    console.log('\n2. Erstelle Test-Invoice...');
    const testInvoice = await prisma.invoice.create({
      data: {
        filename: 'test-invoice.pdf',
        originalName: 'Test Rechnung.pdf',
        filePath: '/tmp/test-invoice.pdf',
        fileSize: 1234,
        mimeType: 'application/pdf',
        companyId: company.id,
      }
    });
    console.log(`✅ Test-Invoice erstellt: ${testInvoice.id}`);
    
    // 3. Erstelle Mock-Extraktionsdaten
    console.log('\n3. Erstelle Mock-Extraktionsdaten...');
    const mockExtractedData: ExtractedInvoiceData = {
      supplierName: 'FAMO GmbH',
      supplierTaxId: 'DE123456789',
      supplierAddress: 'Musterstraße 123, 12345 Musterstadt',
      invoiceNumber: 'RF12345678',
      invoiceDate: new Date('2023-12-01'),
      dueDate: new Date('2023-12-31'),
      totalAmount: 1190.00,
      netAmount: 1000.00,
      vatAmount: 190.00,
      vatRate: 19.0,
      iban: 'DE89370400440532013000',
      extractedText: 'FAMO GmbH Rechnung Nr. RF12345678 Betrag: 1.190,00 EUR USt-IdNr: DE123456789',
      confidence: 85,
      template: 'FAMO'
    };
    console.log('✅ Mock-Daten erstellt');
    
    // 4. Erstelle einen Test-Kreditor oder finde vorhandenen
    console.log('\n4. Überprüfe Test-Kreditor...');
    let testCreditor = await prisma.creditor.findFirst({
      where: { ustId: 'DE123456789' }
    });
    
    if (!testCreditor) {
      testCreditor = await prisma.creditor.create({
        data: {
          name: 'FAMO GmbH',
          ustId: 'DE123456789',
          iban: 'DE89370400440532013000',
          address: 'Musterstraße 123',
          city: 'Musterstadt',
          zipCode: '12345',
          defaultAccount: '4400',
          isActive: true,
          notes: 'Test-Kreditor für Integration'
        }
      });
      console.log(`✅ Test-Kreditor erstellt: ${testCreditor.name}`);
    } else {
      console.log(`✅ Test-Kreditor bereits vorhanden: ${testCreditor.name}`);
    }
    
    // 5. Mock-Buchungsvorschlag
    const mockBookingProposal = {
      debitAccount: '4400',
      creditAccount: '1600',
      amount: 1190.00,
      vatRate: 19.0,
      bookingText: 'Eingangsrechnung FAMO GmbH RF12345678',
      confidence: 85,
      explanation: 'Automatisch generierter Buchungsvorschlag für FAMO-Rechnung'
    };
    console.log('✅ Mock-Buchungsvorschlag erstellt');
    
    // 6. Teste saveProcessingResults Funktion
    console.log('\n5. Teste saveProcessingResults...');
    const processingSteps = [
      'Text erfolgreich extrahiert: 89 Zeichen',
      'Entity Recognition: 10 Felder gefunden',
      'Template erkannt: FAMO',
      'Kreditor: Gefunden',
      'Buchungssatz: Erstellt',
      'Vertrauenswert: 85%'
    ];
    
    const saveResult = await saveProcessingResults(
      testInvoice.id, 
      mockExtractedData, 
      testCreditor, 
      mockBookingProposal, 
      processingSteps
    );
    
    if (saveResult.success) {
      console.log(`✅ Speichern erfolgreich: ${saveResult.message}`);
    } else {
      console.log(`❌ Speichern fehlgeschlagen: ${saveResult.message}`);
      throw new Error(saveResult.message);
    }
    
    // 7. Überprüfe gespeicherte Daten
    console.log('\n6. Überprüfe gespeicherte Daten...');
    
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: testInvoice.id },
      include: { 
        creditor: true,
        bookings: true 
      }
    });
    
    if (!updatedInvoice) {
      throw new Error('Invoice nicht gefunden nach dem Update');
    }
    
    console.log('📊 Gespeicherte Invoice-Daten:');
    console.log(`   - ID: ${updatedInvoice.id}`);
    console.log(`   - Lieferant: ${updatedInvoice.supplierName}`);
    console.log(`   - USt-IdNr: ${updatedInvoice.supplierTaxId}`);
    console.log(`   - Rechnungsnummer: ${updatedInvoice.invoiceNumber}`);
    console.log(`   - Betrag: ${updatedInvoice.totalAmount}€`);
    console.log(`   - Verarbeitet: ${updatedInvoice.processed ? 'Ja' : 'Nein'}`);
    console.log(`   - Kreditor: ${updatedInvoice.creditor?.name || 'Nicht verknüpft'}`);
    console.log(`   - SKR03-Konto: ${updatedInvoice.skr03Account || 'Nicht gesetzt'}`);
    console.log(`   - Buchungen: ${updatedInvoice.bookings.length} Stück`);
    
    // 8. Überprüfe erstellte Buchung
    if (updatedInvoice.bookings.length > 0) {
      const booking = updatedInvoice.bookings[0];
      console.log('\n📝 Buchungssatz-Details:');
      console.log(`   - Sollkonto: ${booking.debitAccount}`);
      console.log(`   - Habenkonto: ${booking.creditAccount}`);
      console.log(`   - Betrag: ${booking.amount}€`);
      console.log(`   - Buchungstext: ${booking.bookingText}`);
      console.log(`   - MwSt.: ${booking.vatRate}%`);
    }
    
    console.log('\n✅ Alle Tests erfolgreich abgeschlossen!');
    console.log('🎉 Die Datenbank-Integration funktioniert korrekt.');
    
    return {
      success: true,
      invoiceId: testInvoice.id,
      creditorId: testCreditor.id,
      bookingCount: updatedInvoice.bookings.length
    };
    
  } catch (error) {
    console.error('\n❌ Test fehlgeschlagen:', error);
    throw error;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Räume Test-Daten auf...');
  
  try {
    // Lösche Test-Buchungen
    await prisma.booking.deleteMany({
      where: {
        company: {
          name: 'Test Company'
        }
      }
    });
    
    // Lösche Test-Invoices
    await prisma.invoice.deleteMany({
      where: {
        company: {
          name: 'Test Company'
        }
      }
    });
    
    // Lösche Test-Kreditoren nur die, die wir erstellt haben
    await prisma.creditor.deleteMany({
      where: {
        AND: [
          { ustId: 'DE123456789' },
          { notes: { contains: 'Test-Kreditor' } }
        ]
      }
    });
    
    // Lösche Test-Company
    await prisma.company.deleteMany({
      where: {
        name: 'Test Company'
      }
    });
    
    console.log('✅ Test-Daten erfolgreich aufgeräumt');
    
  } catch (error) {
    console.error('❌ Fehler beim Aufräumen:', error);
  }
}

// Haupttest-Funktion
async function main() {
  try {
    const result = await testDatabaseIntegration();
    console.log('\n🎯 Test-Ergebnis:', result);
    
  } catch (error) {
    console.error('\n💥 Test-Fehler:', error);
    process.exit(1);
    
  } finally {
    // Aufräumen
    await cleanupTestData();
    await prisma.$disconnect();
    console.log('\n🔚 Test beendet');
  }
}

// Starte Test nur wenn Datei direkt ausgeführt wird
if (require.main === module) {
  main();
}

export { testDatabaseIntegration, cleanupTestData };
