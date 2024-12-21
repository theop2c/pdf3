import { FileUpload, FileList, UsageStats } from './components';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600">Gérez vos fichiers et discutez avec l'IA</p>
          </div>

          <UsageStats />
          <FileUpload />
          <FileList />
        </div>
      </div>
    </div>
  );
}