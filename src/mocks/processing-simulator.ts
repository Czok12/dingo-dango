// Processing Status Types für Mock Server
export interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
}

export interface ProcessingStatus {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  current_step: string;
  steps: ProcessingStep[];
}

// Processing Step Messages
export const PROCESSING_MESSAGES = {
  running: {
    ocr_extraction: 'OCR-Textextraktion läuft...',
    data_validation: 'Validiere extrahierte Daten...',
    skr03_mapping: 'Bestimme SKR03-Konten...',
    booking_creation: 'Erstelle Buchungsvorschlag...',
  },
  completed: {
    file_upload: 'Datei erfolgreich hochgeladen',
    ocr_extraction: 'Text erfolgreich extrahiert',
    data_validation: 'Daten validiert und strukturiert',
    skr03_mapping: 'SKR03-Konto zugeordnet',
    booking_creation: 'Buchungsvorschlag erstellt',
  },
  error: {
    ocr_extraction: 'OCR-Extraktion fehlgeschlagen - Datei unleserlich',
    data_validation: 'Extrahierte Daten unvollständig',
    skr03_mapping: 'Keine passende SKR03-Zuordnung gefunden',
    booking_creation: 'Buchung konnte nicht erstellt werden',
  },
} as const;
