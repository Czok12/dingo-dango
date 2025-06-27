import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/invoices - Abrufen aller Rechnungen mit Paginierung und Filterung
 * 
 * Query-Parameter:
 * - page: Seitenzahl (default: 1)
 * - limit: Anzahl pro Seite (default: 10, max: 100)
 * - search: Textsuche in Dateisname, Kreditor oder Notizen
 * - status: Filtert nach Status (uploaded, processing, completed, error)
 * - creditorName: Filtert nach Kreditorname
 * - dateFrom: Rechnungsdatum von (YYYY-MM-DD)
 * - dateTo: Rechnungsdatum bis (YYYY-MM-DD)
 * - minAmount: Mindestbetrag
 * - maxAmount: Höchstbetrag
 * - sortBy: Sortierung (uploadDate, invoiceDate, amount, creditorName, status)
 * - sortOrder: Sortierreihenfolge (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paginierung
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    
    // Filter-Parameter
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const creditorName = searchParams.get('creditorName')?.trim();
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = parseFloat(searchParams.get('minAmount') || '0');
    const maxAmount = parseFloat(searchParams.get('maxAmount') || '999999999');
    
    // Sortierung
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    
    // Prisma Where-Clause aufbauen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    
    // Textsuche
    if (search) {
      whereClause.OR = [
        { filename: { contains: search } },
        { supplierName: { contains: search } },
        { invoiceNumber: { contains: search } },
        { creditor: { name: { contains: search } } }
      ];
    }
    
    // Status-Filter
    if (status) {
      // Mapping zu den echten Feldern
      if (status === 'uploaded') {
        whereClause.processed = false;
        whereClause.processingError = { equals: null };
      } else if (status === 'processing') {
        whereClause.processed = false;
      } else if (status === 'completed') {
        whereClause.processed = true;
        whereClause.processingError = { equals: null };
      } else if (status === 'error') {
        whereClause.processingError = { not: null };
      }
    }
    
    // Kreditor-Filter
    if (creditorName) {
      whereClause.creditor = {
        name: { contains: creditorName }
      };
    }
    
    // Datums-Filter
    if (dateFrom || dateTo) {
      whereClause.invoiceDate = {};
      if (dateFrom) {
        whereClause.invoiceDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.invoiceDate.lte = new Date(dateTo);
      }
    }
    
    // Betrags-Filter
    if (minAmount > 0 || maxAmount < 999999999) {
      whereClause.totalAmount = {
        gte: minAmount,
        lte: maxAmount
      };
    }
    
    // Sortierung aufbauen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (sortBy === 'creditorName') {
      orderBy.creditor = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }
    
    // Daten abrufen
    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          creditor: {
            select: {
              id: true,
              name: true,
              ustId: true,
              iban: true,
              address: true,
              city: true,
              zipCode: true,
              country: true,
              defaultAccount: true,
              creditorAccount: true,
              accountCode: true
            }
          },
          bookings: {
            select: {
              id: true,
              bookingDate: true,
              bookingText: true,
              debitAccount: true,
              creditAccount: true,
              amount: true,
              vatRate: true
            }
          }
        }
      }),
      prisma.invoice.count({ where: whereClause })
    ]);
    
    // Response-Daten formatieren
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedInvoices = invoices.map((invoice: any) => ({
      id: invoice.id,
      fileName: invoice.filename,
      filename: invoice.filename, // Für Frontend-Kompatibilität
      originalName: invoice.originalName,
      fileSize: invoice.fileSize,
      mimeType: invoice.mimeType,
      uploadDate: invoice.createdAt,
      status: invoice.processingError ? 'error' : 
              invoice.processed ? 'completed' : 'uploaded',
      
      // Extrahierte Daten
      supplierName: invoice.supplierName,
      supplierTaxId: invoice.supplierTaxId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totalAmount,
      netAmount: invoice.netAmount,
      taxAmount: invoice.vatAmount,
      taxRate: invoice.vatRate,
      
      // Verarbeitung
      processed: invoice.processed,
      processedAt: invoice.updatedAt,
      errorMessage: invoice.processingError,
      ocrText: invoice.ocrText,
      
      // Kontierung
      booked: invoice.booked,
      skr03Account: invoice.skr03Account,
      bookingText: invoice.bookingText,
      
      // Kreditor
      creditor: invoice.creditor,
      
      // Buchungsvorschläge
      bookingEntries: invoice.bookings,
      bookings: invoice.bookings, // Für Frontend-Kompatibilität
      hasBookings: (invoice.bookings?.length || 0) > 0,
      
      // Statistiken
      bookingCount: invoice.bookings?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalBookingAmount: invoice.bookings?.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0) || 0
    }));
    
    // Paginierungs-Metadaten
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: formattedInvoices,
      pagination: {
        page: page,
        currentPage: page,
        totalPages,
        totalCount,
        pageSize: limit,
        hasNextPage,
        hasPreviousPage
      },
      summary: {
        totalInvoices: totalCount,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processedInvoices: formattedInvoices.filter((inv: any) => inv.status === 'completed').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        errorInvoices: formattedInvoices.filter((inv: any) => inv.status === 'error').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pendingInvoices: formattedInvoices.filter((inv: any) => inv.status === 'uploaded').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalAmount: formattedInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        averageAmount: totalCount > 0 ? formattedInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0) / totalCount : 0
      },
      filters: {
        search,
        status,
        creditorName,
        dateFrom,
        dateTo,
        minAmount: minAmount > 0 ? minAmount : undefined,
        maxAmount: maxAmount < 999999999 ? maxAmount : undefined
      },
      sorting: {
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error('Fehler beim Abrufen der Rechnungen:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Rechnungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices - Erstellen einer neuen Rechnung
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!body.fileName || !body.fileSize || !body.mimeType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Fehlende erforderliche Felder: fileName, fileSize, mimeType' 
        },
        { status: 400 }
      );
    }
    
    // Neue Rechnung erstellen
    const invoice = await prisma.invoice.create({
      data: {
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        filePath: body.filePath,
        status: body.status || 'uploaded',
        
        // Optionale extrahierte Daten
        invoiceNumber: body.invoiceNumber,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        totalAmount: body.totalAmount,
        netAmount: body.netAmount,
        taxAmount: body.taxAmount,
        taxRate: body.taxRate,
        currency: body.currency || 'EUR',
        
        // Verarbeitungsinfo
        notes: body.notes,
        
        // Kreditor-Verbindung (falls ID bereitgestellt)
        creditorId: body.creditorId
      },
      include: {
        creditor: true,
        bookingEntries: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Rechnung erfolgreich erstellt'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Fehler beim Erstellen der Rechnung:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Erstellen der Rechnung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices - Aktualisieren einer Rechnung
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rechnung-ID ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Rechnung aktualisieren
    const invoice = await prisma.invoice.update({
      where: { id: body.id },
      data: {
        // Nur die Felder aktualisieren, die bereitgestellt wurden
        ...(body.status && { status: body.status }),
        ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
        ...(body.invoiceDate && { invoiceDate: new Date(body.invoiceDate) }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        ...(body.totalAmount !== undefined && { totalAmount: body.totalAmount }),
        ...(body.netAmount !== undefined && { netAmount: body.netAmount }),
        ...(body.taxAmount !== undefined && { taxAmount: body.taxAmount }),
        ...(body.taxRate !== undefined && { taxRate: body.taxRate }),
        ...(body.currency && { currency: body.currency }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.errorMessage !== undefined && { errorMessage: body.errorMessage }),
        ...(body.creditorId && { creditorId: body.creditorId }),
        
        // Aktualisierungszeit setzen
        ...(body.status === 'completed' && { processedAt: new Date() })
      },
      include: {
        creditor: true,
        bookingEntries: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Rechnung erfolgreich aktualisiert'
    });
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Rechnung:', error);
    
    // Prüfe, ob die Rechnung nicht gefunden wurde
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rechnung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Aktualisieren der Rechnung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
