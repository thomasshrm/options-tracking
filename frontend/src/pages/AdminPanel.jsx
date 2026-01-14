import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

const AdminPanel = ({ token, onError }) => {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    apiRequest('/api/admin/users', { token })
      .then(setUsers)
      .catch((err) => onError?.(err.message));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (id, payload) => {
    try {
      await apiRequest(`/api/admin/users/${id}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      loadUsers();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiRequest(`/api/admin/users/${id}`, {
        token,
        method: 'DELETE'
      });
      loadUsers();
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Gestion des utilisateurs</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nom</th>
                <th>Role</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.role}
                      onChange={(event) => updateUser(user.id, { role: event.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={user.isActive}
                        onChange={(event) => updateUser(user.id, { isActive: event.target.checked })}
                      />
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">Aucun utilisateur.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
