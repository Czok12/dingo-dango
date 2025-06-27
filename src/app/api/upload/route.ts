import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Keine Dateien hochgeladen' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Erstelle Upload-Verzeichnis falls es nicht existiert
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const results = [];

    for (const file of files) {
      // Validiere Dateityp
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        results.push({
          filename: file.name,
          error: 'Dateityp nicht unterstützt'
        });
        continue;
      }

      // Validiere Dateigröße (10MB)
      if (file.size > 10 * 1024 * 1024) {
        results.push({
          filename: file.name,
          error: 'Datei zu groß (max. 10MB)'
        });
        continue;
      }

      try {
        // Generiere eindeutigen Dateinamen
        const timestamp = Date.now();
        const fileExtension = path.extname(file.name);
        const filename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
        const filePath = path.join(uploadDir, filename);

        // Speichere Datei
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Speichere in Datenbank
        const invoice = await prisma.invoice.create({
          data: {
            filename,
            originalName: file.name,
            filePath,
            fileSize: file.size,
            mimeType: file.type,
            companyId: 'default-company-id', // TODO: Dynamisch basierend auf User
          }
        });

        results.push({
          id: invoice.id,
          filename: file.name,
          success: true
        });

        // Hier würde normalerweise die OCR-Verarbeitung gestartet
        // TODO: Queue-System für Hintergrundverarbeitung implementieren
        
      } catch (error) {
        console.error('Fehler beim Speichern der Datei:', error);
        results.push({
          filename: file.name,
          error: 'Fehler beim Speichern der Datei'
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Upload-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
