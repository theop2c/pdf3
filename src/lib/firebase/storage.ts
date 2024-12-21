import { ref, deleteObject } from 'firebase/storage';
import { storage, db } from './index';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import type { FichierTeleverse } from '../types';
import { logger } from '../logger';

export const supprimerFichier = async (fichier: FichierTeleverse) => {
  try {
    logger.info('Suppression du fichier:', fichier.id);
    
    // Supprimer de Storage
    const fichierRef = ref(storage, `fichiers/${fichier.utilisateurId}/${fichier.nom}`);
    await deleteObject(fichierRef);
    
    // Supprimer de Firestore
    await deleteDoc(doc(db, 'fichiers', fichier.id));
    
    logger.info('Fichier supprimé avec succès');
  } catch (erreur) {
    logger.error('Erreur lors de la suppression:', erreur);
    throw erreur;
  }
};

export const recupererFichiers = async (utilisateurId: string): Promise<FichierTeleverse[]> => {
  try {
    const fichiersRef = collection(db, 'fichiers');
    const q = query(fichiersRef, where('utilisateurId', '==', utilisateurId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      dateTelechargement: doc.data().dateTelechargement.toDate()
    })) as FichierTeleverse[];
  } catch (erreur) {
    logger.error('Erreur lors de la récupération des fichiers:', erreur);
    throw erreur;
  }
};