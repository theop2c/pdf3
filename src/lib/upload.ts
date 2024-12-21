import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from './firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { logger } from './logger';
import { auth } from './firebase';
import { parseFile } from './parser';

export interface ProgresseTelechargement {
  progression: number;
  url?: string;
  erreur?: Error;
}

export const televerserFichier = async (
  fichier: File,
  utilisateurId: string,
  onProgresse: (progresse: ProgresseTelechargement) => void
): Promise<string> => {
  try {
    if (!auth.currentUser && !import.meta.env.DEV) {
      throw new Error('Utilisateur non authentifié');
    }

    logger.debug('Début du téléversement:', { 
      nom: fichier.name, 
      taille: fichier.size,
      type: fichier.type,
      utilisateurId
    });

    // Parse file content first
    const contenu = await parseFile(fichier);
    if (!contenu) {
      throw new Error('Impossible d\'extraire le contenu du fichier');
    }
    
    // Keep original filename but prefix with timestamp to ensure uniqueness
    const nomFichier = `${Date.now()}_${fichier.name}`;
    const cheminStockage = `fichiers/${utilisateurId}/${nomFichier}`;
    const fichierRef = ref(storage, cheminStockage);
    
    const tache = uploadBytesResumable(fichierRef, fichier);

    return new Promise((resolve, reject) => {
      tache.on(
        'state_changed',
        (snapshot) => {
          const progression = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          logger.debug('Progression:', { progression });
          onProgresse({ progression });
        },
        (erreur) => {
          logger.error('Erreur de téléversement:', erreur);
          const message = erreur.code === 'storage/unauthorized' 
            ? 'Accès non autorisé. Veuillez vous reconnecter.'
            : erreur.message;
          const customError = new Error(message);
          onProgresse({ progression: 0, erreur: customError });
          reject(customError);
        },
        async () => {
          try {
            const url = await getDownloadURL(fichierRef);
            
            // Create a unique document ID
            const docRef = doc(collection(db, 'fichiers'));
            
            // Store file metadata and content in Firestore
            await setDoc(docRef, {
              id: docRef.id, // Include the ID in the document
              utilisateurId,
              nom: fichier.name,
              nomStockage: nomFichier,
              type: fichier.name.split('.').pop(),
              taille: fichier.size,
              url,
              contenu, // Store parsed content
              dateTelechargement: new Date()
            });

            logger.info('Téléversement réussi:', { 
              id: docRef.id,
              url,
              contentLength: contenu.length 
            });
            
            onProgresse({ progression: 100, url });
            resolve(url);
          } catch (erreur) {
            logger.error('Erreur lors de la finalisation:', erreur);
            reject(erreur);
          }
        }
      );
    });
  } catch (erreur) {
    logger.error('Erreur initiale de téléversement:', erreur);
    throw erreur;
  }
};