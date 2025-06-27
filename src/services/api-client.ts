// API-Client für Python/FastAPI Backend

// Environment Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: 30000, // 30 seconds for file uploads
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
} as const;

// TypeScript Interfaces basierend auf Backend-Spezifikation
export interface UploadResult {
  id: string;
  filename: string;
  original_name: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface InvoiceData {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  
  // Extracted data
  supplier_name?: string;
  supplier_tax_id?: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  total_amount?: number;
  net_amount?: number;
  vat_amount?: number;
  vat_rate?: number;
  
  // Processing status
  ocr_text?: string;
  processed: boolean;
  processing_error?: string;
  ocr_confidence?: number;
  
  // Booking information
  booked: boolean;
  suggested_account?: string;
  booking_text?: string;
  suggestion_confidence?: number;
  
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface BookingData {
  id: string;
  booking_date: string;
  booking_text: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  vat_rate?: number;
  invoice_id?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface SKR03Suggestion {
  account_code: string;
  account_name: string;
  confidence: number;
  reasoning: string[];
}

export interface ProcessingResult {
  id: string;
  processing_status: 'completed' | 'failed' | 'processing';
  extracted_data?: Partial<InvoiceData>;
  suggested_booking?: {
    debit_account: string;
    credit_account: string;
    booking_text: string;
    confidence: number;
  };
  ocr_confidence?: number;
  error?: string;
}

// Custom API Error
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API Client
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  private getAuthToken(): string | null {
    // TODO: Implement auth token retrieval
    return localStorage.getItem('auth_token');
  }

  // Upload multiple files
  async uploadFiles(files: File[], companyId?: string): Promise<{ results: UploadResult[] }> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (companyId) {
      formData.append('company_id', companyId);
    }

    return this.request<{ results: UploadResult[] }>('/upload/files', {
      method: 'POST',
      headers: {}, // Remove Content-Type for multipart/form-data
      body: formData,
    });
  }

  // Get invoice list with pagination
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    company_id?: string;
  }): Promise<{
    invoices: InvoiceData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.company_id) searchParams.set('company_id', params.company_id);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    return this.request<{
      invoices: InvoiceData[];
      total: number;
      page: number;
      limit: number;
    }>(`/invoices${query}`);
  }

  // Get single invoice
  async getInvoice(id: string): Promise<InvoiceData> {
    return this.request<InvoiceData>(`/invoices/${id}`);
  }

  // Process invoice (trigger OCR and analysis)
  async processInvoice(id: string): Promise<ProcessingResult> {
    return this.request<ProcessingResult>(`/invoices/${id}/process`, {
      method: 'POST',
    });
  }

  // Get bookings with pagination
  async getBookings(params?: {
    page?: number;
    limit?: number;
    company_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    bookings: BookingData[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.company_id) searchParams.set('company_id', params.company_id);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    return this.request<{
      bookings: BookingData[];
      total: number;
      page: number;
      limit: number;
    }>(`/bookings${query}`);
  }

  // Create booking
  async createBooking(booking: Omit<BookingData, 'id' | 'created_at' | 'updated_at'>): Promise<BookingData> {
    return this.request<BookingData>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  // Get SKR03 account suggestions
  async getSKR03Suggestions(params: {
    text: string;
    supplier_name?: string;
    amount?: number;
  }): Promise<{ suggestions: SKR03Suggestion[] }> {
    return this.request<{ suggestions: SKR03Suggestion[] }>('/skr03/suggest', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request<{ status: string; version: string }>('/health');
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// React Hook für API-Calls mit Loading/Error State
export function useApi() {
  return {
    apiClient,
    ApiError,
  };
}
