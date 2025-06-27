import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/bookings - Abrufen aller Buchungen mit Paginierung und Filterung
 * 
 * Query-Parameter:
 * - page: Seitenzahl (default: 1)
 * - limit: Anzahl pro Seite (default: 10, max: 100)
 * - search: Textsuche in Buchungstext
 * - account: Filtert nach Konto (Soll- oder Habenkonto)
 * - dateFrom: Buchungsdatum von (YYYY-MM-DD)
 * - dateTo: Buchungsdatum bis (YYYY-MM-DD)
 * - minAmount: Mindestbetrag
 * - maxAmount: Höchstbetrag
 * - invoiceId: Filtert nach bestimmter Rechnung
 * - sortBy: Sortierung (date, amount, account, text)
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
    const account = searchParams.get('account')?.trim();
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = parseFloat(searchParams.get('minAmount') || '0');
    const maxAmount = parseFloat(searchParams.get('maxAmount') || '999999999');
    const invoiceId = searchParams.get('invoiceId')?.trim();
    
    // Sortierung
    const sortBy = searchParams.get('sortBy') || 'bookingDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    
    // Prisma Where-Clause aufbauen
    const whereClause: Record<string, unknown> = {};
    
    // Textsuche
    if (search) {
      whereClause.OR = [
        { bookingText: { contains: search } },
        { debitAccount: { contains: search } },
        { creditAccount: { contains: search } },
        { invoice: { supplierName: { contains: search } } },
        { invoice: { invoiceNumber: { contains: search } } }
      ];
    }
    
    // Kontofilter (sucht sowohl in Soll- als auch Habenkonto)
    if (account) {
      whereClause.OR = [
        { debitAccount: { contains: account } },
        { creditAccount: { contains: account } }
      ];
    }
    
    // Datumsfilter
    if (dateFrom || dateTo) {
      whereClause.bookingDate = {};
      if (dateFrom) {
        (whereClause.bookingDate as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (whereClause.bookingDate as Record<string, unknown>).lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }
    
    // Betragsfilter
    if (minAmount > 0 || maxAmount < 999999999) {
      whereClause.amount = {};
      if (minAmount > 0) {
        (whereClause.amount as Record<string, unknown>).gte = minAmount;
      }
      if (maxAmount < 999999999) {
        (whereClause.amount as Record<string, unknown>).lte = maxAmount;
      }
    }
    
    // Rechnungsfilter
    if (invoiceId) {
      whereClause.invoiceId = invoiceId;
    }
    
    // Sortierung konfigurieren
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    switch (sortBy) {
      case 'date':
        orderBy.bookingDate = sortOrder;
        break;
      case 'amount':
        orderBy.amount = sortOrder;
        break;
      case 'account':
        orderBy.debitAccount = sortOrder;
        break;
      case 'text':
        orderBy.bookingText = sortOrder;
        break;
      default:
        orderBy.bookingDate = sortOrder;
    }
    
    // Daten abrufen mit Paginierung
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          invoice: {
            select: {
              id: true,
              filename: true,
              supplierName: true,
              invoiceNumber: true,
              invoiceDate: true,
              totalAmount: true,
              creditor: {
                select: {
                  id: true,
                  name: true,
                  ustId: true
                }
              }
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.booking.count({ where: whereClause })
    ]);
    
    // Daten für Frontend formatieren
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      bookingText: booking.bookingText,
      debitAccount: booking.debitAccount,
      creditAccount: booking.creditAccount,
      amount: booking.amount,
      vatRate: booking.vatRate,
      
      // Beziehungen
      invoice: booking.invoice ? {
        id: booking.invoice.id,
        filename: booking.invoice.filename,
        supplierName: booking.invoice.supplierName,
        invoiceNumber: booking.invoice.invoiceNumber,
        invoiceDate: booking.invoice.invoiceDate?.toISOString().split('T')[0] || null,
        totalAmount: booking.invoice.totalAmount,
        creditor: booking.invoice.creditor ? {
          id: booking.invoice.creditor.id,
          name: booking.invoice.creditor.name,
          ustId: booking.invoice.creditor.ustId
        } : null
      } : null,
      
      company: booking.company ? {
        id: booking.company.id,
        name: booking.company.name
      } : null,
      
      // Metadaten
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      
      // Abgeleitete Felder für Frontend
      hasInvoice: !!booking.invoice,
      formattedAmount: `${booking.amount.toFixed(2)} €`,
      formattedBooking: `${booking.debitAccount} an ${booking.creditAccount}`
    }));
    
    // Paginierungs-Metadaten
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Zusammenfassung für Dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary = {
      totalBookings: totalCount,
      bookingsWithInvoice: bookings.filter((b: any) => b.invoice).length,
      bookingsWithoutInvoice: bookings.filter((b: any) => !b.invoice).length,
      totalAmount: bookings.reduce((sum: number, booking: any) => sum + booking.amount, 0),
      averageAmount: totalCount > 0 ? bookings.reduce((sum: number, booking: any) => sum + booking.amount, 0) / totalCount : 0,
      // Gruppierung nach Konten
      accountBreakdown: await getAccountBreakdown(whereClause),
      // Monatliche Übersicht
      monthlyBreakdown: await getMonthlyBreakdown(whereClause)
    };
    
    return NextResponse.json({
      success: true,
      data: formattedBookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      summary,
      filters: {
        search,
        account,
        dateFrom,
        dateTo,
        minAmount: minAmount > 0 ? minAmount : undefined,
        maxAmount: maxAmount < 999999999 ? maxAmount : undefined,
        invoiceId,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungen:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Fehler beim Abrufen der Buchungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/bookings - Erstellen einer neuen Buchung
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung der Eingabedaten
    const {
      bookingDate,
      bookingText,
      debitAccount,
      creditAccount,
      amount,
      vatRate,
      invoiceId,
      companyId = 'default-company'
    } = body;
    
    if (!bookingDate || !bookingText || !debitAccount || !creditAccount || !amount) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Fehlende Pflichtfelder: bookingDate, bookingText, debitAccount, creditAccount, amount'
        },
        { status: 400 }
      );
    }
    
    // Validiere Konten (müssen im SKR03 existieren)
    const [debitAccountExists, creditAccountExists] = await Promise.all([
      prisma.sKR03Account.findFirst({ where: { accountCode: debitAccount } }),
      prisma.sKR03Account.findFirst({ where: { accountCode: creditAccount } })
    ]);
    
    if (!debitAccountExists) {
      return NextResponse.json(
        { 
          success: false,
          error: `Sollkonto ${debitAccount} existiert nicht im SKR03`
        },
        { status: 400 }
      );
    }
    
    if (!creditAccountExists) {
      return NextResponse.json(
        { 
          success: false,
          error: `Habenkonto ${creditAccount} existiert nicht im SKR03`
        },
        { status: 400 }
      );
    }
    
    // Erstelle neue Buchung
    const booking = await prisma.booking.create({
      data: {
        bookingDate: new Date(bookingDate),
        bookingText,
        debitAccount,
        creditAccount,
        amount: parseFloat(amount),
        vatRate: vatRate ? parseFloat(vatRate) : null,
        invoiceId: invoiceId || null,
        companyId
      },
      include: {
        invoice: {
          include: {
            creditor: true
          }
        },
        company: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Buchung erfolgreich erstellt',
      data: booking
    });
    
  } catch (error) {
    console.error('Fehler beim Erstellen der Buchung:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Fehler beim Erstellen der Buchung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Hilfsfunktion: Konto-Aufschlüsselung
 */
async function getAccountBreakdown(whereClause: Record<string, unknown>) {
  try {
    const accountBreakdown = await prisma.booking.groupBy({
      by: ['debitAccount'],
      where: whereClause,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });
    
    return accountBreakdown.map((item) => ({
      account: item.debitAccount,
      totalAmount: item._sum.amount || 0,
      count: item._count,
      averageAmount: item._count > 0 ? (item._sum.amount || 0) / item._count : 0
    }));
  } catch (error) {
    console.error('Fehler bei Account Breakdown:', error);
    return [];
  }
}

/**
 * Hilfsfunktion: Monatliche Aufschlüsselung
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMonthlyBreakdown(whereClause: Record<string, unknown>) {
  try {
    // SQLite-spezifische Aggregation für Monatsdaten
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', bookingDate) as month,
        COUNT(*) as count,
        SUM(amount) as totalAmount
      FROM bookings 
      WHERE bookingDate >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', bookingDate)
      ORDER BY month DESC
      LIMIT 12
    ` as Array<{ month: string; count: bigint; totalAmount: number }>;
    
    return monthlyData.map((item) => ({
      month: item.month,
      count: Number(item.count),
      totalAmount: item.totalAmount || 0,
      averageAmount: Number(item.count) > 0 ? (item.totalAmount || 0) / Number(item.count) : 0
    }));
  } catch (error) {
    console.error('Fehler bei Monthly Breakdown:', error);
    return [];
  }
}

/**
 * PUT /api/bookings/[id] - Aktualisieren einer Buchung (für Korrekturen)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const bookingId = pathSegments[pathSegments.length - 1];
    
    if (!bookingId || bookingId === 'route.ts') {
      return NextResponse.json(
        { success: false, error: 'Buchungs-ID fehlt' },
        { status: 400 }
      );
    }
    
    const {
      bookingText,
      debitAccount,
      creditAccount,
      amount,
      vatRate
    } = body;
    
    // Buchung aktualisieren
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(bookingText && { bookingText }),
        ...(debitAccount && { debitAccount }),
        ...(creditAccount && { creditAccount }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(vatRate !== undefined && { vatRate: vatRate ? parseFloat(vatRate) : null }),
        updatedAt: new Date()
      },
      include: {
        invoice: true,
        company: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Buchung erfolgreich aktualisiert',
      data: updatedBooking
    });
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Buchung:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Fehler beim Aktualisieren der Buchung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
