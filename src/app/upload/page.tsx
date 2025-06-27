'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadFiles } from '@/services/api-hooks';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();
  
  const uploadMutation = useUploadFiles();

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validiere Dateityp
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Nur PDF-, JPEG-, PNG- und GIF-Dateien sind erlaubt.');
      return;
    }

    // Validiere Dateigröße (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      alert('Die Datei ist zu groß. Maximale Größe: 10MB.');
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync([file]); // Array verwenden
      
      // Erfolg - navigiere zur Rechnungsübersicht mit der ersten hochgeladenen Datei
      const firstUpload = result.results[0];
      if (firstUpload && firstUpload.status !== 'error') {
        router.push(`/invoices?uploaded=${firstUpload.id}`);
      } else {
        // Fallback zur Invoices-Seite ohne spezifische ID
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      // Fehler wird bereits durch React Query Error Boundary gehandelt
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rechnung hochladen
          </h1>
          <p className="text-lg text-gray-600">
            Laden Sie Ihre Eingangsrechnungen hoch für die automatische Kontierung
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center">
              {/* Upload Icon */}
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Datei ausgewählt:
                  </p>
                  <p className="text-blue-600 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Datei hier ablegen oder klicken zum Auswählen
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, JPEG, PNG oder GIF (max. 10MB)
                  </p>
                </div>
              )}

              {/* File Input */}
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileInput}
              />
              <label
                htmlFor="file-upload"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Datei auswählen
              </label>
            </div>
          </div>

          {/* Upload Button */}
          {file && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {uploadMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wird hochgeladen...
                  </span>
                ) : (
                  'Hochladen und Verarbeiten'
                )}
              </button>
            </div>
          )}

          {/* Error Display */}
          {uploadMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Upload fehlgeschlagen
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {uploadMutation.error?.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Automatische Verarbeitung
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• OCR-Texterkennung für gescannte Dokumente</li>
            <li>• Automatische Extraktion von Rechnungsdaten</li>
            <li>• SKR03-konforme Kontierung</li>
            <li>• Erstellen von Buchungsvorschlägen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}