import { HardDrive, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useFilesStore } from '@/store/files';
import { formatBytes } from '@/lib/utils';

export function UsageStats() {
  const { user } = useAuthStore();
  const { files } = useFilesStore();

  const storageUsed = files.reduce((total, file) => total + file.taille, 0);
  const fileCount = files.length;

  const getStorageLimit = () => {
    switch (user?.role) {
      case 'premium': return 20 * 1024 * 1024;
      case 'or': return 50 * 1024 * 1024;
      default: return 5 * 1024 * 1024;
    }
  };

  const getFileLimit = () => {
    switch (user?.role) {
      case 'premium': return 50;
      case 'or': return 100;
      default: return 10;
    }
  };

  const storageLimit = getStorageLimit();
  const fileLimit = getFileLimit();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">Stockage Utilisé</h3>
        </div>
        <p className="mt-2 text-2xl font-semibold">{formatBytes(storageUsed)}</p>
        <p className="text-sm text-gray-500">sur {formatBytes(storageLimit)}</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className="font-medium">Fichiers</h3>
        </div>
        <p className="mt-2 text-2xl font-semibold">{fileCount}</p>
        <p className="text-sm text-gray-500">sur {fileLimit} fichiers</p>
      </div>
    </div>
  );
}