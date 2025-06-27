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
 * Erweiterte Accounting Logic Engine (ALE) - Generiert vollständige Buchungssatz-Vorschläge
 * basierend auf Kontenplan.csv und Kreditor-Datenbank
 */
export function generateBookingProposal(context: AccountingContext): BookingProposal | null {
  try {
    console.log('🔧 Starte Buchungssatz-Generierung...');
    
    // 1. Sachkonto ermitteln (erweiterte Logik)
    const suggestedAccount = suggestSKR03AccountAdvanced(context);
    
    if (!suggestedAccount) {
      console.log('❌ Kein passendes Sachkonto gefunden');
      return null;
    }

    // 2. Kreditorenkonto ermitteln (erweiterte Logik)
    const creditorAccount = determineCreditorAccountAdvanced(context);
    
    // 3. Automatische MwSt.-Behandlung
    const vatDetails = calculateVATDetails(context);
    
    // 4. Buchungssatz zusammenstellen
    const proposal: BookingProposal = {
      debitAccount: suggestedAccount.code, // Soll: Sachkonto (Aufwand)
      creditAccount: creditorAccount, // Haben: Kreditorenkonto
      amount: context.invoiceAmount,
      vatAmount: vatDetails.vatAmount,
      vatRate: vatDetails.vatRate,
      creditorId: context.creditorId,
      bookingText: generateBookingTextAdvanced(context, suggestedAccount),
      confidence: calculateBookingConfidenceAdvanced(context, suggestedAccount),
      explanation: generateBookingExplanationAdvanced(context, suggestedAccount, creditorAccount, vatDetails)
    };

    // 5. Template-spezifische und creditor-spezifische Anpassungen
    applyAdvancedBusinessLogic(proposal, context);

    console.log(`✅ Buchungssatz-Vorschlag: ${proposal.debitAccount} an ${proposal.creditAccount}, ${proposal.amount}€, Confidence: ${proposal.confidence}%`);
    return proposal;

  } catch (error) {
    console.error('❌ Fehler bei der Buchungssatz-Generierung:', error);
    return null;
  }
}

/**
 * Erweiterte Sachkonto-Ermittlung mit Gewichtung und Kontenplan-Integration
 */
function suggestSKR03AccountAdvanced(context: AccountingContext): SKR03Account | null {
  const searchText = `${context.extractedText} ${context.supplierName || ''}`.toLowerCase();
  
  // Kreditor-spezifische Konten haben Priorität
  if (context.defaultCreditorAccount) {
    const creditorAccount = getSKR03AccountByCode(context.defaultCreditorAccount);
    if (creditorAccount) {
      console.log(`🎯 Verwende Kreditor-Standard-Konto: ${creditorAccount.code}`);
      return creditorAccount;
    }
  }
  
  // Template-spezifische Logik
  const templateAccount = getTemplateSpecificAccount(context, searchText);
  if (templateAccount) {
    return templateAccount;
  }
  
  // Erweiterte Keyword-Suche mit Gewichtung
  const weightedMatch = suggestSKR03AccountWithWeighting(
    context.extractedText,
    context.supplierName,
    context.template
  );
  
  if (weightedMatch && weightedMatch.score > 20) {
    console.log(`📊 Bestes Konto (Score: ${weightedMatch.score}): ${weightedMatch.account.code}`);
    return weightedMatch.account;
  }
  
  // Fallback: Allgemeine Heuristik
  return getAccountByBusinessLogic(context);
}

/**
 * Template-spezifische Konten-Ermittlung
 */
function getTemplateSpecificAccount(context: AccountingContext, searchText: string): SKR03Account | null {
  switch (context.template) {
    case 'FAMO':
      if (searchText.includes('wartung') || searchText.includes('reparatur')) {
        return getSKR03AccountByCode('4800'); // Reparatur und Instandhaltung
      }
      if (searchText.includes('fahrzeug') || searchText.includes('kfz')) {
        return getSKR03AccountByCode('4530'); // Fahrzeugkosten
      }
      break;
      
    case 'SONEPAR':
      if (searchText.includes('elektro') || searchText.includes('kabel') || searchText.includes('material')) {
        return getSKR03AccountByCode('3000'); // Wareneinkauf
      }
      break;
  }
  
  return null;
}

/**
 * Business-Logic-basierte Konto-Ermittlung
 */
function getAccountByBusinessLogic(context: AccountingContext): SKR03Account | null {
  const searchText = context.extractedText.toLowerCase();
  const supplierName = (context.supplierName || '').toLowerCase();
  
  // Behörden und Ämter
  if (supplierName.includes('finanzamt')) {
    return getSKR03AccountByCode('4320'); // Gewerbesteuer
  }
  if (supplierName.includes('handwerkskammer') || supplierName.includes('ihk')) {
    return getSKR03AccountByCode('4380'); // Beiträge
  }
  
  // Telekommunikation
  if (supplierName.includes('telekom') || supplierName.includes('vodafone') || 
      supplierName.includes('klarmobil') || searchText.includes('telefon')) {
    return getSKR03AccountByCode('4920'); // Telefon
  }
  
  // Online-Services
  if (supplierName.includes('strato') || supplierName.includes('hosting') || 
      searchText.includes('domain') || searchText.includes('server')) {
    return getSKR03AccountByCode('4925'); // Internetkosten
  }
  
  // E-Commerce
  if (supplierName.includes('amazon') || supplierName.includes('galaxus') || 
      supplierName.includes('notebooksbilliger')) {
    if (searchText.includes('büro') || searchText.includes('papier') || searchText.includes('software')) {
      return getSKR03AccountByCode('4930'); // Bürobedarf
    }
    return getSKR03AccountByCode('4980'); // Sonstiger Betriebsbedarf
  }
  
  // Transport und Logistik
  if (supplierName.includes('dhl') || supplierName.includes('ups') || 
      supplierName.includes('hermes') || searchText.includes('versand')) {
    return getSKR03AccountByCode('4910'); // Porto
  }
  
  // Standard-Fallback
  return getSKR03AccountByCode('4980'); // Sonstiger Betriebsbedarf
}

/**
 * Erweiterte Kreditorenkonto-Ermittlung
 */
function determineCreditorAccountAdvanced(context: AccountingContext): string {
  // 1. Spezifisches Kreditorenkonto aus Kontenplan
  if (context.creditorId && context.defaultCreditorAccount) {
    console.log(`🎯 Verwende spezifisches Kreditorenkonto: ${context.defaultCreditorAccount}`);
    return context.defaultCreditorAccount;
  }
  
  // 2. Template-spezifische Kreditorenkonten
  const templateAccount = getTemplateCreditorAccount(context);
  if (templateAccount) {
    return templateAccount;
  }
  
  // 3. Betragsspezifische Logik
  if (context.invoiceAmount > 10000) {
    return '1665'; // Verbindlichkeiten gegenüber Gesellschaftern (größere Beträge)
  }
  
  // 4. Standard-Kreditorenkonto
  return '1600'; // Verbindlichkeiten aus Lieferungen und Leistungen
}

/**
 * Template-spezifische Kreditorenkonten
 */
function getTemplateCreditorAccount(context: AccountingContext): string | null {
  if (!context.template || context.template === 'GENERIC') {
    return null;
  }
  
  // Hier könnten spezifische Kreditorenkonten für bekannte Templates definiert werden
  // Beispiel: FAMO verwendet ein anderes Kreditorenkonto als Sonepar
  
  return null;
}

/**
 * MwSt.-Berechnung und -Validierung
 */
function calculateVATDetails(context: AccountingContext): { vatAmount: number | undefined, vatRate: number | undefined } {
  let vatAmount = context.vatAmount;
  const vatRate = context.vatRate;
  
  // Automatische MwSt.-Berechnung falls fehlend
  if (!vatAmount && vatRate && context.invoiceAmount) {
    vatAmount = (context.invoiceAmount * vatRate) / (100 + vatRate);
    console.log(`🧮 MwSt.-Betrag berechnet: ${vatAmount.toFixed(2)}€`);
  }
  
  // MwSt.-Satz-Validierung
  if (vatRate && ![0, 7, 19].includes(vatRate)) {
    console.log(`⚠️ Ungewöhnlicher MwSt.-Satz: ${vatRate}%`);
  }
  
  return { vatAmount, vatRate };
}

/**
 * Erweiterte Buchungstext-Generierung
 */
function generateBookingTextAdvanced(context: AccountingContext, account: SKR03Account): string {
  const supplier = context.supplierName || 'Unbekannter Lieferant';
  const accountName = account.name;
  const date = new Date().toLocaleDateString('de-DE');
  
  // Template-spezifische Buchungstexte
  if (context.template === 'FAMO') {
    return `Fahrzeugwartung - ${supplier} vom ${date}`;
  }
  
  if (context.template === 'SONEPAR') {
    return `Elektromaterial - ${supplier} vom ${date}`;
  }
  
  // Kategorie-spezifische Texte
  switch (account.category) {
    case 'Wareneinkauf':
      return `Wareneinkauf - ${supplier} vom ${date}`;
    case 'Büro':
      return `Büromaterial - ${supplier} vom ${date}`;
    case 'Kommunikation':
      return `Telekommunikation - ${supplier} vom ${date}`;
    case 'Instandhaltung':
      return `Wartung/Reparatur - ${supplier} vom ${date}`;
    default:
      return `${accountName} - ${supplier} vom ${date}`;
  }
}

/**
 * Erweiterte Confidence-Berechnung
 */
function calculateBookingConfidenceAdvanced(context: AccountingContext, account: SKR03Account): number {
  let confidence = 0;
  let maxScore = 0;

  // Sachkonto-Matching (35%)
  maxScore += 35;
  if (context.defaultCreditorAccount === account.code) {
    confidence += 35; // Perfekter Match mit Kreditor-Standard
  } else {
    const keywordMatches = account.keywords.filter(keyword => 
      context.extractedText.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    confidence += Math.min(35, keywordMatches * 7);
  }

  // Kreditor-Identifikation (25%)
  maxScore += 25;
  if (context.creditorId) {
    confidence += 25;
  } else if (context.supplierName) {
    confidence += 12;
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

  // Datenqualität-Bonus (10%)
  maxScore += 10;
  if (context.supplierTaxId) confidence += 5;
  if (context.extractedText.length > 100) confidence += 5;

  return maxScore > 0 ? Math.round((confidence / maxScore) * 100) : 0;
}

/**
 * Erweiterte Buchungssatz-Erklärung
 */
function generateBookingExplanationAdvanced(
  context: AccountingContext, 
  account: SKR03Account, 
  creditorAccount: string,
  vatDetails: { vatAmount: number | undefined, vatRate: number | undefined }
): string {
  const explanations: string[] = [];
  
  explanations.push(`Sachkonto ${account.code} (${account.name}) - ${account.category}`);
  explanations.push(`Kreditorenkonto ${creditorAccount} für ${context.supplierName || 'Lieferant'}`);
  
  if (context.template && context.template !== 'GENERIC') {
    explanations.push(`${context.template}-Template erkannt`);
  }
  
  if (context.defaultCreditorAccount) {
    explanations.push(`Kreditor-Standard-Konto verwendet`);
  }
  
  if (vatDetails.vatRate) {
    explanations.push(`MwSt.: ${vatDetails.vatRate}% (${vatDetails.vatAmount?.toFixed(2) || 'N/A'}€)`);
  }

  return explanations.join(' | ');
}

/**
 * Erweiterte Business-Logik und Template-Anpassungen
 */
function applyAdvancedBusinessLogic(proposal: BookingProposal, context: AccountingContext): void {
  // Template-spezifische Anpassungen
  switch (context.template) {
    case 'FAMO':
      applyFAMOLogic(proposal, context);
      break;
      
    case 'SONEPAR':
      applySoneparLogic(proposal, context);
      break;
  }
  
  // Allgemeine Business-Rules
  applyGeneralBusinessRules(proposal, context);
}

/**
 * FAMO-spezifische Geschäftslogik
 */
function applyFAMOLogic(proposal: BookingProposal, context: AccountingContext): void {
  const searchText = context.extractedText.toLowerCase();
  
  if (searchText.includes('fahrzeugwartung') || searchText.includes('inspektion')) {
    proposal.debitAccount = '4800'; // Reparatur und Instandhaltung
    proposal.bookingText = `Fahrzeugwartung - FAMO GmbH`;
    proposal.confidence = Math.min(proposal.confidence + 15, 100);
  }
  
  if (searchText.includes('ersatzteile')) {
    proposal.debitAccount = '3000'; // Wareneinkauf
    proposal.bookingText = `Kfz-Ersatzteile - FAMO GmbH`;
  }
}

/**
 * Sonepar-spezifische Geschäftslogik
 */
function applySoneparLogic(proposal: BookingProposal, context: AccountingContext): void {
  const searchText = context.extractedText.toLowerCase();
  
  if (searchText.includes('elektroinstallation') || searchText.includes('verkabelung')) {
    proposal.debitAccount = '3000'; // Wareneinkauf
    proposal.bookingText = `Elektroinstallationsmaterial - Sonepar`;
    proposal.confidence = Math.min(proposal.confidence + 15, 100);
  }
  
  if (searchText.includes('werkzeug')) {
    proposal.debitAccount = '4985'; // Werkzeuge und Kleingeräte
    proposal.bookingText = `Elektrowerkzeuge - Sonepar`;
  }
}

/**
 * Allgemeine Geschäftsregeln
 */
function applyGeneralBusinessRules(proposal: BookingProposal, context: AccountingContext): void {
  // Kleinbetragsregelung
  if (context.invoiceAmount <= 150) {
    // Bei Kleinbeträgen: Sofort-Aufwand statt Aktivierung
    if (proposal.debitAccount.startsWith('04') || proposal.debitAccount.startsWith('05')) {
      proposal.debitAccount = '4855'; // Sofortabschreibung GWG
      proposal.explanation += ` | Kleinbetrag: Sofort-Aufwand`;
    }
  }
  
  // Hochbetrag-Warnung
  if (context.invoiceAmount > 5000) {
    proposal.explanation += ` | Hochbetrag: Prüfung erforderlich`;
    proposal.confidence = Math.max(proposal.confidence - 10, 50);
  }
  
  // MwSt.-Plausibilität
  if (context.vatRate === 0 && context.invoiceAmount > 1000) {
    proposal.explanation += ` | Keine MwSt.: Prüfung erforderlich`;
    proposal.confidence = Math.max(proposal.confidence - 5, 60);
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
