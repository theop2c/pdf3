import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useFilesStore } from '@/store/files';

export function Chat() {
  const navigate = useNavigate();
  const { fileId } = useParams();
  const { user } = useAuthStore();
  const { messages, sendMessage, loading, error, clearMessages, retryLastMessage, fetchMessages } = useChatStore();
  const { files, fetchFiles } = useFilesStore();

  useEffect(() => {
    if (user && fileId) {
      fetchFiles(user.id).then(() => {
        fetchMessages(fileId);
      });
    }
  }, [user, fileId, fetchFiles, fetchMessages]);

  const currentFile = files.find(f => f.id === fileId);

  const handleClearMessages = async () => {
    if (fileId && confirm('Êtes-vous sûr de vouloir effacer tout l\'historique du chat ?')) {
      await clearMessages(fileId);
    }
  };

  if (!currentFile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Document introuvable</p>
          <Button onClick={() => navigate('/chat')}>
            Retour aux discussions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mt-8 flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chat')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h2 className="text-lg font-semibold">{currentFile.nom}</h2>
                <p className="text-sm text-gray-500">Discussion sur le document</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearMessages}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Effacer la discussion
              </Button>
            )}
          </div>
          
          <MessageList messages={messages} />
          
          {error && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryLastMessage}
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          )}
          
          <MessageInput
            onSend={sendMessage}
            disabled={loading}
          />

          {loading && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Traitement en cours...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}