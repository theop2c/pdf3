import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { televerserFichier, ProgresseTelechargement } from '@/lib/upload';
import { BarreProgression } from '@/components/upload/ProgressBar';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { logger } from '@/lib/logger';

export function FileUpload() {
  const { user } = useAuthStore();
  const { fetchFiles } = useFilesStore();
  const [progress, setProgress] = useState<ProgresseTelechargement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setError(null);
    setProgress({ progression: 0 });

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Le fichier dépasse la limite de 5 Mo');
        }

        await televerserFichier(file, user.id, (progress) => {
          setProgress(progress);
          if (progress.erreur) {
            setError(progress.erreur.message);
          }
        });
      }

      await fetchFiles(user.id);
      setTimeout(() => setProgress(null), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec du téléversement';
      logger.error('Erreur de téléversement:', err);
      setError(message);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400 transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">
            Déposez vos fichiers ici ou cliquez pour téléverser
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Word, Excel, PDF (max 5 Mo)
          </span>
          <input
            type="file"
            className="hidden"
            accept=".docx,.xlsx,.pdf"
            multiple
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {progress && (
        <div className="space-y-2">
          <BarreProgression progression={progress.progression} />
          <p className="text-sm text-gray-600 text-center">
            {progress.progression === 100
              ? 'Téléversement terminé !'
              : `Téléversement en cours... ${Math.round(progress.progression)}%`}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}