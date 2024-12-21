import { useState } from 'react';
import { useAdminStore } from '@/store/admin';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle } from 'lucide-react';
import type { Utilisateur } from '@/types';

export function UsersList() {
  const { users, updateUserRole, blockUser } = useAdminStore();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: Utilisateur['role']) => {
    try {
      await updateUserRole(userId, role);
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      await blockUser(userId, blocked);
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <select
                    className="text-sm border rounded p-1"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Utilisateur['role'])}
                  >
                    <option value="gratuit">Gratuit</option>
                    <option value="premium">Premium</option>
                    <option value="or">Or</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'or' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'premium' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}
                  >
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {user.blocked ? 'Bloqué' : 'Actif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                >
                  {editingUser === user.id ? 'Annuler' : 'Modifier'}
                </Button>
                <Button
                  variant={user.blocked ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => handleBlockUser(user.id, !user.blocked)}
                  className={user.blocked ? 'text-green-600' : 'text-red-600'}
                >
                  {user.blocked ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Ban className="w-4 h-4 mr-1" />
                  )}
                  {user.blocked ? 'Débloquer' : 'Bloquer'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}