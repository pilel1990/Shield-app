// Tarifs officiels ShieldApp — NE PAS MODIFIER côté client
export const TARIFS = {
  garde_corps_vip: {
    label: 'Garde du corps VIP',
    prix_heure: 150000,
    icon: '🛡️',
    description: 'Protection rapprochée personnalisée',
  },
  protection_evenement: {
    label: "Protection d'événement",
    prix_heure: 100000,
    icon: '🎪',
    description: 'Sécurité pour événements et cérémonies',
  },
  surveillance_site: {
    label: 'Surveillance de site',
    prix_heure: 50000,
    icon: '🏗️',
    description: 'Surveillance et contrôle de site industriel',
  },
  securite_residentielle: {
    label: 'Sécurité résidentielle',
    prix_heure: 60000,
    icon: '🏠',
    description: 'Protection domicile et famille',
  },
  escorte_securisee: {
    label: 'Escorte sécurisée',
    prix_heure: 120000,
    icon: '🚗',
    description: 'Escorte de personnes ou valeurs',
  },
  mission_sur_mesure: {
    label: 'Mission sur mesure',
    prix_heure: 80000,
    icon: '⚙️',
    description: 'Missions spéciales selon besoins',
  },
}

// Commission plateforme (côté serveur uniquement — ne jamais afficher)
export const COMMISSION_PLATFORM = 0.25  // 25%
export const FRAIS_SERVICE_CLIENT = 0.05 // 5%
export const AGENT_PART = 0.75           // 75%

// Majorations urgence
export const MAJORATION_URGENT = 0.25    // +25%
export const MAJORATION_IMMEDIAT = 0.50  // +50%

// Minimum heures
export const MIN_HEURES = 3

// Formatage GNF
export const formatGNF = (montant) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant)
}

export const formatGNFSimple = (montant) => {
  return `${new Intl.NumberFormat('fr-FR').format(montant)} GNF`
}
