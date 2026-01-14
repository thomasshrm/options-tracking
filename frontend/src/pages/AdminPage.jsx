import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const AdminPage = () => {
  const { token, apiUrl } = useAuth();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const response = await fetch(`${apiUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (id, payload) => {
    await fetch(`${apiUrl}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    loadUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`${apiUrl}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadUsers();
  };

  return (
    <div>
      <h1 className="h3 mb-4">Administration</h1>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Utilisateurs</h5>
          {users.length === 0 ? (
            <p className="text-muted">Aucun utilisateur.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Rôle</th>
                    <th>Statut</th>
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
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>{user.isActive ? "Actif" : "Inactif"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        >
                          {user.isActive ? "Désactiver" : "Activer"}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
