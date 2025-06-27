// SKR03 Standardkontenrahmen für UGs
export interface SKR03Account {
  code: string;
  name: string;
  type: 'Aktiva' | 'Passiva' | 'Aufwand' | 'Ertrag';
  category: string;
  keywords: string[];
}

export const SKR03_ACCOUNTS: SKR03Account[] = [
  // Aufwendungen für Roh-, Hilfs- und Betriebsstoffe (6000-6099)
  {
    code: '6000',
    name: 'Wareneinkauf',
    type: 'Aufwand',
    category: 'Wareneinkauf',
    keywords: ['waren', 'einkauf', 'material', 'rohstoffe']
  },

  // Löhne und Gehälter (6100-6199)
  {
    code: '6100',
    name: 'Löhne und Gehälter',
    type: 'Aufwand',
    category: 'Personal',
    keywords: ['lohn', 'gehalt', 'personal', 'mitarbeiter']
  },
  {
    code: '6110',
    name: 'Gesetzliche soziale Aufwendungen',
    type: 'Aufwand',
    category: 'Personal',
    keywords: ['sozialversicherung', 'krankenkasse', 'rentenversicherung']
  },

  // Raumkosten (6200-6299)
  {
    code: '6200',
    name: 'Mieten',
    type: 'Aufwand',
    category: 'Raumkosten',
    keywords: ['miete', 'büromiete', 'raummiete', 'pacht']
  },
  {
    code: '6210',
    name: 'Nebenkosten des Geldverkehrs',
    type: 'Aufwand',
    category: 'Finanzierung',
    keywords: ['bankgebühren', 'kontoführung', 'überweisungsgebühren']
  },

  // Versicherungen (6300-6399)
  {
    code: '6300',
    name: 'Versicherungen',
    type: 'Aufwand',
    category: 'Versicherungen',
    keywords: ['versicherung', 'haftpflicht', 'betriebshaftpflicht']
  },

  // Kfz-Kosten (6400-6499)
  {
    code: '6400',
    name: 'Kfz-Kosten',
    type: 'Aufwand',
    category: 'Fahrzeuge',
    keywords: ['auto', 'fahrzeug', 'benzin', 'diesel', 'tankstelle', 'reparatur']
  },

  // Reisekosten (6500-6599)
  {
    code: '6500',
    name: 'Reisekosten Inland',
    type: 'Aufwand',
    category: 'Reisekosten',
    keywords: ['reise', 'fahrt', 'hotel', 'übernachtung', 'verpflegung']
  },

  // Werbe- und Reisekosten (6600-6699)
  {
    code: '6600',
    name: 'Werbekosten',
    type: 'Aufwand',
    category: 'Marketing',
    keywords: ['werbung', 'marketing', 'anzeige', 'promotion', 'flyer']
  },

  // Verschiedene betriebliche Aufwendungen (6800-6899)
  {
    code: '6800',
    name: 'Porto',
    type: 'Aufwand',
    category: 'Kommunikation',
    keywords: ['porto', 'briefmarke', 'versand', 'dhl', 'post']
  },
  {
    code: '6805',
    name: 'Telefon',
    type: 'Aufwand',
    category: 'Kommunikation',
    keywords: ['telefon', 'handy', 'smartphone', 'mobilfunk', 'telekom']
  },
  {
    code: '6810',
    name: 'Zeitschriften, Bücher',
    type: 'Aufwand',
    category: 'Fortbildung',
    keywords: ['buch', 'zeitschrift', 'fachbuch', 'literatur']
  },
  {
    code: '6815',
    name: 'Bürobedarf',
    type: 'Aufwand',
    category: 'Büro',
    keywords: ['büro', 'papier', 'stifte', 'ordner', 'büromaterial', 'software', 'hosting', 'domain']
  },
  {
    code: '6820',
    name: 'Fortbildungskosten',
    type: 'Aufwand',
    category: 'Fortbildung',
    keywords: ['fortbildung', 'schulung', 'seminar', 'kurs', 'weiterbildung']
  },
  {
    code: '6825',
    name: 'Rechts- und Beratungskosten',
    type: 'Aufwand',
    category: 'Beratung',
    keywords: ['anwalt', 'rechtsanwalt', 'beratung', 'steuerberater', 'notar']
  },
  {
    code: '6830',
    name: 'Buchführungskosten',
    type: 'Aufwand',
    category: 'Buchhaltung',
    keywords: ['buchhaltung', 'buchführung', 'steuerberater', 'datev']
  },
  {
    code: '6840',
    name: 'Bürokosten',
    type: 'Aufwand',
    category: 'Büro',
    keywords: ['bürokosten', 'reinigung', 'wartung', 'reparatur']
  },

  // Abschreibungen (6900-6999)
  {
    code: '6900',
    name: 'Abschreibungen auf Sachanlagen',
    type: 'Aufwand',
    category: 'Abschreibungen',
    keywords: ['abschreibung', 'computer', 'möbel', 'ausstattung']
  },

  // Zinsen und ähnliche Aufwendungen (7000-7099)
  {
    code: '7000',
    name: 'Zinsen für kurzfristige Verbindlichkeiten',
    type: 'Aufwand',
    category: 'Finanzierung',
    keywords: ['zinsen', 'kredit', 'darlehen', 'finanzierung']
  },

  // Steuern (7100-7199)
  {
    code: '7100',
    name: 'Gewerbesteuer',
    type: 'Aufwand',
    category: 'Steuern',
    keywords: ['gewerbesteuer', 'steuer']
  },

  // Umsatzerlöse (8000-8999)
  {
    code: '8400',
    name: 'Erlöse 19% USt',
    type: 'Ertrag',
    category: 'Umsatzerlöse',
    keywords: ['umsatz', 'erlös', 'verkauf', 'honorar']
  },
  {
    code: '8300',
    name: 'Erlöse 7% USt',
    type: 'Ertrag',
    category: 'Umsatzerlöse',
    keywords: ['umsatz', 'erlös', 'verkauf', 'ermäßigt']
  }
];

// Funktion zur automatischen Kontierung basierend auf Rechnungstext
export function suggestSKR03Account(invoiceText: string, supplierName?: string): SKR03Account | null {
  const searchText = `${invoiceText} ${supplierName || ''}`.toLowerCase();
  
  // Suche nach passenden Konten basierend auf Keywords
  const matches = SKR03_ACCOUNTS.filter(account => 
    account.keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    )
  );

  if (matches.length === 0) {
    return null;
  }

  // Gebe das Konto mit den meisten Keyword-Treffern zurück
  const accountScores = matches.map(account => ({
    account,
    score: account.keywords.filter(keyword => 
      searchText.includes(keyword.toLowerCase())
    ).length
  }));

  accountScores.sort((a, b) => b.score - a.score);
  return accountScores[0].account;
}

// Hilfsfunktion zum Abrufen eines Kontos nach Code
export function getSKR03AccountByCode(code: string): SKR03Account | null {
  return SKR03_ACCOUNTS.find(account => account.code === code) || null;
}

// Hilfsfunktion zum Abrufen aller Konten nach Typ
export function getSKR03AccountsByType(type: SKR03Account['type']): SKR03Account[] {
  return SKR03_ACCOUNTS.filter(account => account.type === type);
}

// Interface für Buchungssatz-Vorschlag
export interface BookingProposal {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  bookingText: string;
  vatAmount?: number;
  vatRate?: number;
  creditorId?: string;
  confidence: number;
  explanation: string;
}

// Interface für erweiterte Kontierungslogik
export interface AccountingContext {
  supplierName?: string;
  supplierTaxId?: string;
  creditorId?: string;
  defaultCreditorAccount?: string;
  invoiceAmount: number;
  vatAmount?: number;
  vatRate?: number;
  extractedText: string;
  template?: 'FAMO' | 'SONEPAR' | 'GENERIC';
}

/**
 * Accounting Logic Engine (ALE) - Generiert vollständige Buchungssatz-Vorschläge
 */
export function generateBookingProposal(context: AccountingContext): BookingProposal | null {
  try {
    // 1. Sachkonto ermitteln
    const suggestedAccount = suggestSKR03Account(context.extractedText, context.supplierName);
    
    if (!suggestedAccount) {
      console.log('Kein passendes Sachkonto gefunden');
      return null;
    }

    // 2. Kreditorenkonto ermitteln
    const creditorAccount = determineCreditorAccount(context);
    
    // 3. Buchungssatz zusammenstellen
    const proposal: BookingProposal = {
      debitAccount: suggestedAccount.code, // Soll: Sachkonto (Aufwand)
      creditAccount: creditorAccount, // Haben: Kreditorenkonto
      amount: context.invoiceAmount,
      vatAmount: context.vatAmount,
      vatRate: context.vatRate,
      creditorId: context.creditorId,
      bookingText: generateBookingText(context, suggestedAccount),
      confidence: calculateBookingConfidence(context, suggestedAccount),
      explanation: generateBookingExplanation(context, suggestedAccount, creditorAccount)
    };

    // 4. Template-spezifische Anpassungen
    applyTemplateSpecificLogic(proposal, context);

    console.log(`Buchungssatz-Vorschlag generiert: ${proposal.debitAccount} an ${proposal.creditAccount}`);
    return proposal;

  } catch (error) {
    console.error('Fehler bei der Buchungssatz-Generierung:', error);
    return null;
  }
}

/**
 * Ermittelt das passende Kreditorenkonto
 */
function determineCreditorAccount(context: AccountingContext): string {
  // Wenn Kreditor bekannt ist und ein Standard-Konto hat
  if (context.defaultCreditorAccount) {
    return context.defaultCreditorAccount;
  }

  // Template-spezifische Kreditorenkonten
  if (context.template === 'FAMO') {
    return '1600'; // FAMO-spezifisches Kreditorenkonto
  }
  
  if (context.template === 'SONEPAR') {
    return '1610'; // Sonepar-spezifisches Kreditorenkonto
  }

  // Standard-Kreditorenkonto für unbekannte Lieferanten
  return '1400'; // Verbindlichkeiten aus Lieferungen und Leistungen
}

/**
 * Generiert einen aussagekräftigen Buchungstext
 */
function generateBookingText(context: AccountingContext, account: SKR03Account): string {
  const supplier = context.supplierName || 'Unbekannter Lieferant';
  const accountName = account.name;
  const date = new Date().toLocaleDateString('de-DE');
  
  return `${accountName} - ${supplier} vom ${date}`;
}

/**
 * Berechnet die Confidence für den Buchungssatz-Vorschlag
 */
function calculateBookingConfidence(context: AccountingContext, account: SKR03Account): number {
  let confidence = 0;
  let maxScore = 0;

  // Sachkonto-Matching (40%)
  maxScore += 40;
  const keywordMatches = account.keywords.filter(keyword => 
    context.extractedText.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  confidence += Math.min(40, keywordMatches * 10);

  // Kreditor-Identifikation (30%)
  maxScore += 30;
  if (context.creditorId) {
    confidence += 30;
  } else if (context.supplierName) {
    confidence += 15;
  }

  // Template-Erkennung (20%)
  maxScore += 20;
  if (context.template && context.template !== 'GENERIC') {
    confidence += 20;
  } else if (context.template === 'GENERIC') {
    confidence += 10;
  }

  // Betragsinformationen (10%)
  maxScore += 10;
  if (context.invoiceAmount > 0) {
    confidence += 5;
  }
  if (context.vatAmount && context.vatRate) {
    confidence += 5;
  }

  return maxScore > 0 ? Math.round((confidence / maxScore) * 100) : 0;
}

/**
 * Generiert eine Erklärung für den Buchungssatz-Vorschlag
 */
function generateBookingExplanation(
  context: AccountingContext, 
  account: SKR03Account, 
  creditorAccount: string
): string {
  const explanations: string[] = [];
  
  explanations.push(`Sachkonto ${account.code} (${account.name}) basierend auf Rechnungsinhalt`);
  explanations.push(`Kreditorenkonto ${creditorAccount} für ${context.supplierName || 'Lieferant'}`);
  
  if (context.template && context.template !== 'GENERIC') {
    explanations.push(`${context.template}-Template erkannt`);
  }
  
  if (context.vatRate) {
    explanations.push(`MwSt.-Satz: ${context.vatRate}%`);
  }

  return explanations.join(' | ');
}

/**
 * Wendet template-spezifische Buchungslogik an
 */
function applyTemplateSpecificLogic(proposal: BookingProposal, context: AccountingContext): void {
  switch (context.template) {
    case 'FAMO':
      // FAMO-spezifische Anpassungen
      if (context.extractedText.toLowerCase().includes('wartung')) {
        proposal.debitAccount = '6320'; // Instandhaltung
        proposal.bookingText = `Wartungsarbeiten - FAMO GmbH`;
      }
      break;
      
    case 'SONEPAR':
      // Sonepar-spezifische Anpassungen
      if (context.extractedText.toLowerCase().includes('elektro')) {
        proposal.debitAccount = '6000'; // Wareneinkauf
        proposal.bookingText = `Elektromaterial - Sonepar`;
      }
      break;
      
    default:
      // Keine spezifischen Anpassungen für generische Templates
      break;
  }
}

/**
 * Erweiterte Keyword-Suche mit Gewichtung
 */
export function suggestSKR03AccountWithWeighting(
  invoiceText: string, 
  supplierName?: string,
  template?: string
): { account: SKR03Account; score: number } | null {
  const searchText = `${invoiceText} ${supplierName || ''}`.toLowerCase();
  
  const accountScores = SKR03_ACCOUNTS.map(account => {
    let score = 0;
    
    // Grundscore basierend auf Keyword-Matches
    const keywordMatches = account.keywords.filter(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
    score += keywordMatches.length * 10;
    
    // Template-spezifische Gewichtung
    if (template === 'FAMO' && account.category === 'Instandhaltung') {
      score += 20;
    }
    if (template === 'SONEPAR' && account.category === 'Wareneinkauf') {
      score += 20;
    }
    
    // Kategorie-Bonus für häufige Geschäftsvorfälle
    if (['Wareneinkauf', 'Bürobedarf', 'Instandhaltung'].includes(account.category)) {
      score += 5;
    }
    
    return { account, score };
  });
  
  // Sortiere nach Score und gebe das beste Ergebnis zurück
  accountScores.sort((a, b) => b.score - a.score);
  
  const bestMatch = accountScores[0];
  return bestMatch.score > 0 ? bestMatch : null;
}
