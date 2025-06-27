import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDefaultCompany() {
  try {
    // Prüfe, ob bereits eine Standard-Company existiert
    const existingCompany = await prisma.company.findFirst({
      where: { name: 'Standard Company' }
    });

    if (!existingCompany) {
      const defaultCompany = await prisma.company.create({
        data: {
          id: 'default-company',
          name: 'Standard Company',
          address: 'Musterstraße 1',
          city: 'Musterstadt',
          zipCode: '12345',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('Standard-Company erstellt:', defaultCompany);
    } else {
      console.log('Standard-Company bereits vorhanden:', existingCompany);
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Standard-Company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultCompany();
