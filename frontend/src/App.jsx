import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    const message = await response.json().catch(() => ({ message: "Erreur" }));
    throw new Error(message.message || "Erreur" );
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const AuthContext = React.createContext(null);

const useAuth = () => React.useContext(AuthContext);

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Options Tracking
          </Link>
          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/positions">
                      Positions
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        Administration
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
            <div className="d-flex">
              {!user ? (
                <>
                  <Link className="btn btn-outline-light me-2" to="/login">
                    Connexion
                  </Link>
                  <Link className="btn btn-warning" to="/register">
                    Inscription
                  </Link>
                </>
              ) : (
                <button className="btn btn-outline-light" onClick={logout}>
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-4">{children}</main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Home = () => (
  <div className="row align-items-center g-4">
    <div className="col-lg-6">
      <h1 className="display-5 fw-bold">Suivez vos positions d'options</h1>
      <p className="lead">
        Gérez vos stratégies Cash Secured Put, Covered Call, Naked Call, Naked Put et plus encore
        avec un tableau de bord dédié.
      </p>
      <ul className="list-group">
        <li className="list-group-item">Ouverture et clôture de positions</li>
        <li className="list-group-item">Tableau de bord de performance</li>
        <li className="list-group-item">Gestion des utilisateurs par l'administrateur</li>
      </ul>
    </div>
    <div className="col-lg-6">
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">MVP prêt à l'emploi</h5>
          <p className="card-text">
            Connectez-vous pour gérer vos opérations et suivre votre performance globale.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h4">Connexion</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </div>
              <button className="btn btn-dark w-100" type="submit">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setSuccess(true);
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h4">Inscription</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">Compte créé, connectez-vous.</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </div>
              <button className="btn btn-dark w-100" type="submit">
                Créer mon compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchJson("/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data) {
    return <div className="alert alert-info">Chargement...</div>;
  }

  return (
    <div className="row g-4">
      <div className="col-md-3">
        <div className="card text-bg-dark h-100">
          <div className="card-body">
            <h6>Total positions</h6>
            <p className="display-6">{data.totalPositions}</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-secondary h-100">
          <div className="card-body">
            <h6>Ouvertes</h6>
            <p className="display-6">{data.openPositions}</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-success h-100">
          <div className="card-body">
            <h6>Clôturées</h6>
            <p className="display-6">{data.closedPositions}</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-warning h-100">
          <div className="card-body">
            <h6>PnL total</h6>
            <p className="display-6">{data.totalPnl.toFixed(2)} €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Positions = () => {
  const { token } = useAuth();
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState({ type: "Cash Secured Put", symbol: "", quantity: 1, premium: 0 });
  const [error, setError] = useState("");

  const loadPositions = async () => {
    try {
      const data = await fetchJson("/positions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPositions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPositions();
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await fetchJson("/positions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      setForm({ type: "Cash Secured Put", symbol: "", quantity: 1, premium: 0 });
      loadPositions();
    } catch (err) {
      setError(err.message);
    }
  };

  const closePosition = async (id) => {
    const pnl = Number(prompt("PnL réalisé ?", "0"));
    if (Number.isNaN(pnl)) {
      return;
    }
    await fetchJson(`/positions/${id}/close`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pnl })
    });
    loadPositions();
  };

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>Nouvelle position</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  <option>Cash Secured Put</option>
                  <option>Covered Call</option>
                  <option>Naked Call</option>
                  <option>Naked Put</option>
                  <option>Naked Put Selling</option>
                  <option>Naked Call Selling</option>
                  <option>Iron Condor</option>
                  <option>Butterfly</option>
                  <option>Straddle</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Symbole</label>
                <input
                  className="form-control"
                  value={form.symbol}
                  onChange={(event) => setForm({ ...form, symbol: event.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Quantité</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Prime</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={form.premium}
                  onChange={(event) => setForm({ ...form, premium: Number(event.target.value) })}
                  required
                />
              </div>
              <button className="btn btn-dark w-100" type="submit">
                Ouvrir
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>Mes positions</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbole</th>
                    <th>Statut</th>
                    <th>Prime</th>
                    <th>PnL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td>{position.type}</td>
                      <td>{position.symbol}</td>
                      <td>
                        <span className={position.status === "open" ? "badge text-bg-info" : "badge text-bg-success"}>
                          {position.status}
                        </span>
                      </td>
                      <td>{position.premium}</td>
                      <td>{position.pnl ?? 0}</td>
                      <td>
                        {position.status === "open" && (
                          <button className="btn btn-sm btn-outline-dark" onClick={() => closePosition(position.id)}>
                            Clôturer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!positions.length && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Aucune position pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const data = await fetchJson("/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const toggleActive = async (user) => {
    await fetchJson(`/users/${user.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !user.active })
    });
    loadUsers();
  };

  const toggleRole = async (user) => {
    await fetchJson(`/users/${user.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: user.role === "admin" ? "user" : "admin" })
    });
    loadUsers();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5>Administration des utilisateurs</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? "Oui" : "Non"}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-dark" onClick={() => toggleRole(user)}>
                      Changer rôle
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => toggleActive(user)}>
                      {user.active ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      login,
      logout
    }),
    [auth]
  );

  return (
    <AuthContext.Provider value={value}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/positions"
              element={
                <ProtectedRoute>
                  <Positions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
