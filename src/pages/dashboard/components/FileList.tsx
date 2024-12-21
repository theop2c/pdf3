import { useEffect, useState } from 'react';
import { File, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { FichierTeleverse } from '@/types';
import { formatBytes } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/modals/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';

export function FileList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { files, loading, error, fetchFiles, deleteFile, setCurrentFile } = useFilesStore();
  const [fileToDelete, setFileToDelete] = useState<FichierTeleverse | null>(null);

  useEffect(() => {
    if (user) {
      fetchFiles(user.id);
    }
  }, [user, fetchFiles]);

  const handleDelete = async (file: FichierTeleverse) => {
    try {
      await deleteFile(file);
    } catch (err) {
      // Error handling is managed by the store
    }
  };

  const handleChatClick = (file: FichierTeleverse) => {
    setCurrentFile(file);
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => user && fetchFiles(user.id)}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Vos Fichiers</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => user && fetchFiles(user.id)}
        >
          Actualiser
        </Button>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Aucun fichier téléversé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">{file.nom}</p>
                  <p className="text-sm text-gray-500">
                    {formatBytes(file.taille)} • {new Date(file.dateTelechargement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChatClick(file)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileToDelete(file)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={() => {
          if (fileToDelete) {
            handleDelete(fileToDelete);
            setFileToDelete(null);
          }
        }}
        title="Supprimer le fichier"
        message={`Êtes-vous sûr de vouloir supprimer "${fileToDelete?.nom}" ? Cette action est irréversible.`}
      />
    </div>
  );
}