export interface Utilisateur {
  id: string;
  email: string;
  role: 'gratuit' | 'premium' | 'or' | 'admin';
  blocked?: boolean;
  stockageUtilise: number;
  nombreFichiers: number;
  derniereMiseAJour: Date;
  jetonUtilises: {
    entree: number;
    sortie: number;
  };
}

// ... rest of the types remain unchanged