import { QuestionMatrix } from './components/QuestionMatrix';

export function Matrices() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Matrices de Questions</h1>
            <p className="text-gray-600">Créez et gérez vos matrices de questions</p>
          </div>

          <QuestionMatrix />
        </div>
      </div>
    </div>
  );
}