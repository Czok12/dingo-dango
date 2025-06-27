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
