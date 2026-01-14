import { useEffect, useState } from "react";
import { request } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Admin = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const data = await request("/admin/users", { token });
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await request(`/admin/users/${id}/role`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, isActive) => {
    try {
      await request(`/admin/users/${id}/status`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ isActive })
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h5">Administration des utilisateurs</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-striped">
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
                  <td>{user.role}</td>
                  <td>{user.isActive ? "Actif" : "Inactif"}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => updateRole(user.id, user.role === "admin" ? "user" : "admin")}
                    >
                      {user.role === "admin" ? "Passer en user" : "Passer admin"}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => updateStatus(user.id, !user.isActive)}
                    >
                      {user.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
