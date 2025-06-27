// React Hooks für API-Integration mit React Query
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError, InvoiceData, BookingData, UploadResult, ProcessingResult } from './api-client';
import { toast } from 'react-hot-toast';

// Hook für File Upload mit optimistischem Update
export function useUploadFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      return apiClient.uploadFiles(files);
    },
    onSuccess: (data) => {
      // Invalidate invoices query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      const successCount = data.results.filter(r => r.status !== 'error').length;
      const errorCount = data.results.length - successCount;
      
      if (successCount > 0) {
        toast.success(`${successCount} Datei(en) erfolgreich hochgeladen`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} Datei(en) konnten nicht hochgeladen werden`);
      }
    },
    onError: (error: ApiError) => {
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
    },
  });
}

// Hook für Rechnungsliste mit Pagination
export function useInvoices(params?: {
  page?: number;
  limit?: number;
  status?: string;
  company_id?: string;
}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => apiClient.getInvoices(params),
    staleTime: 5 * 60 * 1000, // 5 Minuten
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false; // Don't retry client errors
      }
      return failureCount < 3;
    },
  });
}

// Hook für einzelne Rechnung
export function useInvoice(id: string, enabled = true) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => apiClient.getInvoice(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

// Hook für Rechnungsverarbeitung
export function useProcessInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiClient.processInvoice(invoiceId);
    },
    onSuccess: (data, invoiceId) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(['invoice', invoiceId], (old: InvoiceData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          processed: data.processing_status === 'completed',
          processing_error: data.error,
          // Merge extracted data if available
          ...(data.extracted_data || {}),
        };
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });

      if (data.processing_status === 'completed') {
        toast.success('Rechnung erfolgreich verarbeitet');
      } else if (data.processing_status === 'failed') {
        toast.error(`Verarbeitung fehlgeschlagen: ${data.error}`);
      }
    },
    onError: (error: ApiError) => {
      toast.error(`Verarbeitung fehlgeschlagen: ${error.message}`);
    },
  });
}

// Hook für Buchungen
export function useBookings(params?: {
  page?: number;
  limit?: number;
  company_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => apiClient.getBookings(params),
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

// Hook für neue Buchung erstellen
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Omit<BookingData, 'id' | 'created_at' | 'updated_at'>) => {
      return apiClient.createBooking(booking);
    },
    onSuccess: () => {
      // Invalidate bookings to refresh the list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Buchung erfolgreich erstellt');
    },
    onError: (error: ApiError) => {
      toast.error(`Buchung fehlgeschlagen: ${error.message}`);
    },
  });
}

// Hook für SKR03 Vorschläge
export function useSKR03Suggestions() {
  return useMutation({
    mutationFn: async (params: {
      text: string;
      supplier_name?: string;
      amount?: number;
    }) => {
      return apiClient.getSKR03Suggestions(params);
    },
  });
}

// Hook für Backend-Gesundheitsstatus
export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 60000, // Check every minute
    retry: 1,
    staleTime: 30 * 1000, // 30 Sekunden
  });
}

// Custom Hook für Development: Mock Data
export function useMockData() {
  const isProduction = process.env.NODE_ENV === 'production';
  const backendAvailable = process.env.NEXT_PUBLIC_API_URL !== undefined;
  
  return {
    shouldUseMockData: !isProduction && !backendAvailable,
    mockInvoices: [
      {
        id: 'mock-1',
        filename: 'demo_rechnung_001.pdf',
        original_name: 'Büromaterial_Rechnung_Januar.pdf',
        file_path: '/uploads/demo_rechnung_001.pdf',
        file_size: 125000,
        mime_type: 'application/pdf',
        supplier_name: 'Büro & Mehr GmbH',
        supplier_tax_id: 'DE123456789',
        invoice_number: 'R-2024-001',
        invoice_date: '2024-01-15',
        due_date: '2024-02-14',
        total_amount: 287.50,
        net_amount: 241.67,
        vat_amount: 45.83,
        vat_rate: 19,
        processed: true,
        booked: false,
        suggested_account: '6815',
        booking_text: 'Büromaterial und Software',
        suggestion_confidence: 0.95,
        company_id: 'default-company-id',
        created_at: '2024-01-16T10:30:00Z',
        updated_at: '2024-01-16T10:35:00Z',
      },
      // Weitere Mock-Daten...
    ] as InvoiceData[],
    mockBookings: [
      {
        id: 'mock-booking-1',
        booking_date: '2024-01-16',
        booking_text: 'Büromaterial und Software',
        debit_account: '6815',
        credit_account: '1600',
        amount: 287.50,
        vat_rate: 19,
        invoice_id: 'mock-1',
        company_id: 'default-company-id',
        created_at: '2024-01-16T10:30:00Z',
        updated_at: '2024-01-16T10:30:00Z',
      },
      // Weitere Mock-Daten...
    ] as BookingData[],
  };
}

// Development-Hook für Backend-Connection-Status
export function useConnectionStatus() {
  const { data: health, isError, isLoading } = useBackendHealth();
  
  return {
    isConnected: !isError && health?.status === 'ok',
    isLoading,
    backendVersion: health?.version,
    error: isError,
  };
}
