// High-Fidelity Mock Service Worker Server
// Simuliert exakt die Backend-API aus FRONTEND_BACKEND_INTEGRATION.md

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MockDatabase } from './enhanced-database';
import { ProcessingStatus, PROCESSING_MESSAGES } from './processing-simulator';
import { delay } from 'msw';

// Mock Database Instance
const mockDb = MockDatabase.getInstance();

// Processing Status Tracker
const processingStatuses = new Map<string, ProcessingStatus>();

// API Base URL
const API_BASE = 'http://localhost:8000/api/v1';

// Mock Handlers basierend auf FRONTEND_BACKEND_INTEGRATION.md
export const handlers = [
  // Health Check
  http.get(`${API_BASE}/health`, async () => {
    await delay(100); // Simuliere Netzwerk-Latenz
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }),

  // File Upload - POST /api/v1/upload
  http.post(`${API_BASE}/upload`, async ({ request }) => {
    await delay(1000); // Simuliere Upload-Zeit
    
    try {
      const formData = await request.formData();
      const files = formData.getAll('files') as File[];
      
      if (files.length === 0) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Keine Dateien hochgeladen',
              details: { field: 'files' },
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }

      const results = [];
      
      for (const file of files) {
        // Validierung der Datei
        if (file.size > 10 * 1024 * 1024) { // 10MB Limit
          return HttpResponse.json(
            {
              error: {
                code: 'FILE_TOO_LARGE',
                message: 'Datei ist zu groß (Maximum: 10MB)',
                details: {
                  filename: file.name,
                  size: file.size,
                  max_size: 10 * 1024 * 1024,
                },
                timestamp: new Date().toISOString(),
              },
            },
            { status: 413 }
          );
        }

        // MIME-Type Validierung
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          return HttpResponse.json(
            {
              error: {
                code: 'INVALID_FILE_TYPE',
                message: 'Ungültiger Dateityp',
                details: {
                  filename: file.name,
                  mime_type: file.type,
                  allowed_types: allowedTypes,
                },
                timestamp: new Date().toISOString(),
              },
            },
            { status: 422 }
          );
        }

        const uploadResult = await mockDb.uploadFile(file);
        results.push(uploadResult);

        // Starte Processing-Simulation
        const processingStatus: ProcessingStatus = {
          id: uploadResult.id,
          status: 'processing',
          progress: 0,
          current_step: 'file_upload',
          steps: [
            {
              name: 'file_upload',
              status: 'completed',
              message: 'Datei erfolgreich hochgeladen',
            },
            {
              name: 'ocr_extraction',
              status: 'pending',
              message: 'Warten auf OCR-Verarbeitung',
            },
            {
              name: 'data_validation',
              status: 'pending',
              message: 'Warten auf Datenvalidierung',
            },
            {
              name: 'skr03_mapping',
              status: 'pending',
              message: 'SKR03-Zuordnung ausstehend',
            },
            {
              name: 'booking_creation',
              status: 'pending',
              message: 'Buchung erstellen',
            },
          ],
        };

        processingStatuses.set(uploadResult.id, processingStatus);
        
        // Simuliere asynchrone Verarbeitung
        setTimeout(() => simulateProcessing(uploadResult.id), 2000);
      }

      return HttpResponse.json({ results });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'UPLOAD_ERROR',
            message: 'Fehler beim Datei-Upload',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }),

  // Get Invoices - GET /api/v1/invoices
  http.get(`${API_BASE}/invoices`, async ({ request }) => {
    await delay(300); // Simuliere Datenbankabfrage
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || 'all';
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') || 'desc';

    const result = await mockDb.getInvoices({
      page,
      limit,
      status: status === 'all' ? undefined : status,
      sortBy,
      sortOrder,
    });

    return HttpResponse.json(result);
  }),

  // Get Single Invoice - GET /api/v1/invoices/{id}
  http.get(`${API_BASE}/invoices/:id`, async ({ params }) => {
    await delay(200);
    
    const invoice = await mockDb.getInvoice(params.id as string);
    
    if (!invoice) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Rechnung nicht gefunden',
            details: { id: params.id },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(invoice);
  }),

  // Get Processing Status - GET /api/v1/invoices/{id}/status
  http.get(`${API_BASE}/invoices/:id/status`, async ({ params }) => {
    await delay(100);
    
    const status = processingStatuses.get(params.id as string);
    
    if (!status) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Processing-Status nicht gefunden',
            details: { id: params.id },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(status);
  }),

  // Get Bookings - GET /api/v1/bookings
  http.get(`${API_BASE}/bookings`, async ({ request }) => {
    await delay(250);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const account = url.searchParams.get('account');

    const result = await mockDb.getBookings({
      page,
      limit,
      dateFrom,
      dateTo,
      account,
    });

    return HttpResponse.json(result);
  }),

  // SKR03 Suggestions - POST /api/v1/skr03/suggest
  http.post(`${API_BASE}/skr03/suggest`, async ({ request }) => {
    await delay(500); // KI-Verarbeitung dauert länger
    
    const body = await request.json() as {
      text: string;
      supplier_name?: string;
      amount?: number;
    };

    const suggestions = await mockDb.getSKR03Suggestions(body);
    
    return HttpResponse.json({ suggestions });
  }),

  // Create Booking - POST /api/v1/bookings
  http.post(`${API_BASE}/bookings`, async ({ request }) => {
    await delay(200);
    
    const bookingData = await request.json();
    const booking = await mockDb.createBooking(bookingData);
    
    return HttpResponse.json(booking, { status: 201 });
  }),

  // Error Simulation für Testing
  http.get(`${API_BASE}/test/error/:code`, async ({ params }) => {
    const code = parseInt(params.code as string);
    
    await delay(100);
    
    const errorResponses: Record<number, any> = {
      400: {
        error: {
          code: 'BAD_REQUEST',
          message: 'Ungültige Anfrage',
          timestamp: new Date().toISOString(),
        },
      },
      401: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Nicht authentifiziert',
          timestamp: new Date().toISOString(),
        },
      },
      403: {
        error: {
          code: 'FORBIDDEN',
          message: 'Zugriff verweigert',
          timestamp: new Date().toISOString(),
        },
      },
      500: {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Interner Serverfehler',
          timestamp: new Date().toISOString(),
        },
      },
    };

    return HttpResponse.json(
      errorResponses[code] || errorResponses[500],
      { status: code }
    );
  }),
];

// Processing Simulation
async function simulateProcessing(uploadId: string) {
  const status = processingStatuses.get(uploadId);
  if (!status) return;

  const steps = status.steps;
  const stepNames = ['ocr_extraction', 'data_validation', 'skr03_mapping', 'booking_creation'];
  
  for (let i = 0; i < stepNames.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 Sekunden pro Schritt
    
    const stepName = stepNames[i];
    const step = steps.find(s => s.name === stepName);
    
    if (step) {
      step.status = 'running';
      step.message = getRunningMessage(stepName);
      status.current_step = stepName;
      status.progress = Math.round(((i + 1) / stepNames.length) * 100);
    }

    // Simuliere zufällige Fehler (5% Chance)
    if (Math.random() < 0.05) {
      if (step) {
        step.status = 'error';
        step.message = getErrorMessage(stepName);
      }
      status.status = 'error';
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Verarbeitungszeit
    
    if (step) {
      step.status = 'completed';
      step.message = getCompletedMessage(stepName);
    }
  }

  status.status = 'completed';
  status.progress = 100;
  status.current_step = 'completed';

  // Erstelle Invoice-Daten nach erfolgreicher Verarbeitung
  await mockDb.completeProcessing(uploadId);
}

function getRunningMessage(step: string): string {
  const messages: Record<string, string> = {
    ocr_extraction: 'OCR-Textextraktion läuft...',
    data_validation: 'Validiere extrahierte Daten...',
    skr03_mapping: 'Bestimme SKR03-Konten...',
    booking_creation: 'Erstelle Buchungsvorschlag...',
  };
  return messages[step] || 'Verarbeitung läuft...';
}

function getCompletedMessage(step: string): string {
  const messages: Record<string, string> = {
    ocr_extraction: 'Text erfolgreich extrahiert',
    data_validation: 'Daten validiert und strukturiert',
    skr03_mapping: 'SKR03-Konto zugeordnet',
    booking_creation: 'Buchungsvorschlag erstellt',
  };
  return messages[step] || 'Schritt abgeschlossen';
}

function getErrorMessage(step: string): string {
  const messages: Record<string, string> = {
    ocr_extraction: 'OCR-Extraktion fehlgeschlagen - Datei unleserlich',
    data_validation: 'Extrahierte Daten unvollständig',
    skr03_mapping: 'Keine passende SKR03-Zuordnung gefunden',
    booking_creation: 'Buchung konnte nicht erstellt werden',
  };
  return messages[step] || 'Unbekannter Fehler';
}

// Server Setup für Node.js (für Tests)
export const server = setupServer(...handlers);
