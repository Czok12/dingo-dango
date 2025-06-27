import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { processInvoice } from '@/services/processing-service';

const prisma = new PrismaClient();

// Temporäres Upload-Verzeichnis erstellen falls es nicht existiert
const uploadDir = path.join(process.cwd(), 'uploads');

async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

// Unterstützte Dateitypen
const SUPPORTED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'application/pdf': 'pdf'
};

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Keine Dateien hochgeladen' },
        { status: 400 }
      );
    }

    const processedFiles: Array<{
      id: string;
      filename: string;
      type: string;
      size: number;
      status: 'processing' | 'completed' | 'error';
      extractedText?: string;
      error?: string;
    }> = [];

    // Verarbeite jede Datei
    for (const file of files) {
      const fileId = crypto.randomUUID();
      const fileType = file.type;
      
      // Prüfe unterstützte Dateitypen
      if (!Object.keys(SUPPORTED_TYPES).includes(fileType)) {
        processedFiles.push({
          id: fileId,
          filename: file.name,
          type: fileType,
          size: file.size,
          status: 'error',
          error: `Nicht unterstützter Dateityp: ${fileType}`
        });
        continue;
      }

      try {
        // Datei temporär speichern
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = SUPPORTED_TYPES[fileType as keyof typeof SUPPORTED_TYPES];
        const tempFilePath = path.join(uploadDir, `${fileId}.${extension}`);
        
        await fs.writeFile(tempFilePath, buffer);

        // Speichere Datei-Informationen in der Datenbank (erst mal ohne extrahierten Text)
        await prisma.invoice.create({
          data: {
            id: fileId,
            filename: file.name,
            originalName: file.name,
            filePath: tempFilePath,
            fileSize: file.size,
            mimeType: fileType,
            companyId: 'default-company', // TODO: Dynamisch setzen
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Starte die Verarbeitung mit dem Processing-Service
        const extractedData = await processInvoice(tempFilePath, fileId);

        processedFiles.push({
          id: fileId,
          filename: file.name,
          type: fileType,
          size: file.size,
          status: 'completed',
          extractedText: extractedData.extractedText
        });

      } catch (error) {
        console.error(`Fehler beim Verarbeiten der Datei ${file.name}:`, error);
        
        processedFiles.push({
          id: fileId,
          filename: file.name,
          type: fileType,
          size: file.size,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${processedFiles.length} Datei(en) verarbeitet`,
      files: processedFiles
    });

  } catch (error) {
    console.error('Upload-Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Fehler beim Upload der Dateien',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

// Hilfsfunktion zum Aufräumen alter temporärer Dateien (nicht als Route-Export)
async function cleanupTempFiles() {
  try {
    const files = await fs.readdir(uploadDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Temporäre Datei gelöscht: ${file}`);
      }
    }
  } catch (error) {
    console.error('Fehler beim Aufräumen temporärer Dateien:', error);
  }
}
