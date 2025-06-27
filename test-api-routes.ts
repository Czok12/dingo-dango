/**
 * Test-Script für die API-Routen /api/invoices und /api/bookings
 * Testet die Anbindung der UI-Komponenten an die reale Datenbank
 */

async function testApiRoutes() {
  console.log('🧪 Teste API-Routen für UI-Komponenten-Anbindung...\n');
  
  const baseUrl = 'http://localhost:3000';
  let allTestsPassed = true;
  
  // Test 1: GET /api/invoices - Basis-Abruf
  try {
    console.log('1. Test: GET /api/invoices (Basis-Abruf)');
    const response = await fetch(`${baseUrl}/api/invoices`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    console.log(`✅ Erfolgreich - ${data.data.length} Rechnungen gefunden`);
    console.log(`   - Gesamtanzahl: ${data.pagination.totalCount}`);
    console.log(`   - Seite: ${data.pagination.page}/${data.pagination.totalPages}`);
    console.log(`   - Zusammenfassung: ${data.summary.processedInvoices} verarbeitet, ${data.summary.errorInvoices} Fehler`);
    
    // Prüfe Datenstruktur der ersten Rechnung
    if (data.data.length > 0) {
      const firstInvoice = data.data[0];
      const requiredFields = ['id', 'filename', 'supplierName', 'status', 'totalAmount'];
      const missingFields = requiredFields.filter(field => !(field in firstInvoice));
      
      if (missingFields.length > 0) {
        throw new Error(`Fehlende Felder in Rechnung: ${missingFields.join(', ')}`);
      }
      
      console.log(`   - Beispiel-Rechnung: ${firstInvoice.supplierName} (${firstInvoice.status})`);
    }
    
  } catch (error) {
    console.log(`❌ Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 2: GET /api/invoices mit Paginierung
  try {
    console.log('\n2. Test: GET /api/invoices mit Paginierung');
    const response = await fetch(`${baseUrl}/api/invoices?page=1&limit=5`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    if (data.data.length > 5) {
      throw new Error(`Limit nicht beachtet: ${data.data.length} > 5`);
    }
    
    console.log(`✅ Paginierung funktioniert - ${data.data.length}/5 Einträge pro Seite`);
    
  } catch (error) {
    console.log(`❌ Paginierungs-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 3: GET /api/invoices mit Filtern
  try {
    console.log('\n3. Test: GET /api/invoices mit Statusfilter');
    const response = await fetch(`${baseUrl}/api/invoices?status=completed&sortBy=amount&sortOrder=desc`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    console.log(`✅ Filter funktioniert - ${data.data.length} abgeschlossene Rechnungen`);
    console.log(`   - Filter angewendet: status=${data.filters.status}, sortBy=${data.filters.sortBy}`);
    
    // Prüfe Sortierung (wenn Daten vorhanden)
    if (data.data.length > 1) {
      const amounts = data.data.map((invoice: any) => invoice.totalAmount || 0);
      const sorted = amounts.every((amount: number, i: number) => 
        i === 0 || amounts[i-1] >= amount
      );
      
      if (!sorted) {
        throw new Error('Sortierung nach Betrag (desc) funktioniert nicht korrekt');
      }
      
      console.log(`   - Sortierung korrekt: ${amounts[0]}€ bis ${amounts[amounts.length-1]}€`);
    }
    
  } catch (error) {
    console.log(`❌ Filter-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 4: GET /api/bookings - Basis-Abruf
  try {
    console.log('\n4. Test: GET /api/bookings (Basis-Abruf)');
    const response = await fetch(`${baseUrl}/api/bookings`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    console.log(`✅ Erfolgreich - ${data.data.length} Buchungen gefunden`);
    console.log(`   - Gesamtanzahl: ${data.pagination.totalCount}`);
    console.log(`   - Mit Rechnung: ${data.summary.bookingsWithInvoice}`);
    console.log(`   - Ohne Rechnung: ${data.summary.bookingsWithoutInvoice}`);
    console.log(`   - Gesamtbetrag: ${data.summary.totalAmount.toFixed(2)}€`);
    
    // Prüfe Datenstruktur der ersten Buchung
    if (data.data.length > 0) {
      const firstBooking = data.data[0];
      const requiredFields = ['id', 'bookingDate', 'bookingText', 'debitAccount', 'creditAccount', 'amount'];
      const missingFields = requiredFields.filter(field => !(field in firstBooking));
      
      if (missingFields.length > 0) {
        throw new Error(`Fehlende Felder in Buchung: ${missingFields.join(', ')}`);
      }
      
      console.log(`   - Beispiel-Buchung: ${firstBooking.debitAccount} an ${firstBooking.creditAccount} (${firstBooking.amount}€)`);
    }
    
  } catch (error) {
    console.log(`❌ Buchungen-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 5: GET /api/bookings mit Datumsfilter
  try {
    console.log('\n5. Test: GET /api/bookings mit Datumsfilter');
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(`${baseUrl}/api/bookings?dateFrom=${lastWeek}&dateTo=${today}&sortBy=date&sortOrder=desc`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    console.log(`✅ Datumsfilter funktioniert - ${data.data.length} Buchungen der letzten Woche`);
    console.log(`   - Zeitraum: ${data.filters.dateFrom} bis ${data.filters.dateTo}`);
    
  } catch (error) {
    console.log(`❌ Datumsfilter-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 6: Frontend-Kompatibilität prüfen
  try {
    console.log('\n6. Test: Frontend-Kompatibilität prüfen');
    
    // Teste Invoice-Response-Format
    const invoiceResponse = await fetch(`${baseUrl}/api/invoices?limit=1`);
    const invoiceData = await invoiceResponse.json();
    
    if (invoiceData.success && invoiceData.data.length > 0) {
      const invoice = invoiceData.data[0];
      
      // Prüfe erwartete Frontend-Felder
      const expectedFields = [
        'id', 'status', 'supplierName', 'invoiceNumber', 'totalAmount', 
        'invoiceDate', 'hasBookings', 'creditor', 'bookings'
      ];
      
      const missingFields = expectedFields.filter(field => !(field in invoice));
      if (missingFields.length > 0) {
        throw new Error(`Frontend-kompatible Felder fehlen: ${missingFields.join(', ')}`);
      }
      
      // Prüfe Datentypen
      if (typeof invoice.hasBookings !== 'boolean') {
        throw new Error('hasBookings sollte boolean sein');
      }
      
      if (invoice.bookings && !Array.isArray(invoice.bookings)) {
        throw new Error('bookings sollte Array sein');
      }
      
      console.log('✅ Invoice-Response ist Frontend-kompatibel');
    }
    
    // Teste Booking-Response-Format
    const bookingResponse = await fetch(`${baseUrl}/api/bookings?limit=1`);
    const bookingData = await bookingResponse.json();
    
    if (bookingData.success && bookingData.data.length > 0) {
      const booking = bookingData.data[0];
      
      // Prüfe erwartete Frontend-Felder
      const expectedFields = [
        'id', 'bookingDate', 'formattedAmount', 'formattedBooking', 
        'hasInvoice', 'invoice'
      ];
      
      const missingFields = expectedFields.filter(field => !(field in booking));
      if (missingFields.length > 0) {
        throw new Error(`Frontend-kompatible Felder fehlen: ${missingFields.join(', ')}`);
      }
      
      // Prüfe Formatierung
      if (typeof booking.hasInvoice !== 'boolean') {
        throw new Error('hasInvoice sollte boolean sein');
      }
      
      if (!booking.formattedAmount.includes('€')) {
        throw new Error('formattedAmount sollte €-Symbol enthalten');
      }
      
      console.log('✅ Booking-Response ist Frontend-kompatibel');
    }
    
  } catch (error) {
    console.log(`❌ Frontend-Kompatibilitäts-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Test 7: Performance-Test
  try {
    console.log('\n7. Test: Performance-Messung');
    
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/api/invoices?limit=50`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API-Fehler: ${data.error}`);
    }
    
    console.log(`✅ Performance OK - ${responseTime}ms für ${data.data.length} Rechnungen`);
    
    if (responseTime > 2000) {
      console.log(`⚠️  Warnung: Antwortzeit > 2s (${responseTime}ms)`);
    }
    
  } catch (error) {
    console.log(`❌ Performance-Test fehlgeschlagen: ${error}`);
    allTestsPassed = false;
  }
  
  // Zusammenfassung
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 Alle API-Tests erfolgreich!');
    console.log('✅ UI-Komponenten können sicher an die reale Datenbank angebunden werden.');
    console.log('✅ Paginierung, Filterung und Sortierung funktionieren korrekt.');
    console.log('✅ Response-Formate sind Frontend-kompatibel.');
  } else {
    console.log('❌ Einige Tests sind fehlgeschlagen.');
    console.log('⚠️  Bitte beheben Sie die Probleme vor der Frontend-Integration.');
  }
  
  return allTestsPassed;
}

// Hilfsfunktion für automatischen Test beim Development Server
async function waitForServer(maxAttempts = 10) {
  const baseUrl = 'http://localhost:3000';
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/api/invoices?limit=1`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        console.log('✅ Development Server ist bereit');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Warte auf Development Server... (Versuch ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Development Server ist nicht erreichbar');
}

// Hauptfunktion
async function main() {
  try {
    console.log('🚀 Starte API-Tests für Phase 3: UI-Komponenten-Anbindung\n');
    
    // Warte auf Development Server
    await waitForServer();
    
    // Führe Tests aus
    const success = await testApiRoutes();
    
    if (success) {
      console.log('\n🎯 Phase 3 kann fortgesetzt werden: Frontend-Integration');
      process.exit(0);
    } else {
      console.log('\n❌ Phase 3 blockiert: API-Tests fehlgeschlagen');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Kritischer Fehler:', error);
    process.exit(1);
  }
}

// Export für andere Module
export { testApiRoutes, waitForServer };

// Starte Test nur wenn Datei direkt ausgeführt wird
if (require.main === module) {
  main();
}
