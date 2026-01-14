import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';

const AuthPage = ({ onAuth }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = mode === 'register'
        ? { email: form.email, password: form.password, username: form.username }
        : { email: form.email, password: form.password };
      const data = await apiRequest(`/api/auth/${mode === 'register' ? 'register' : 'login'}`,
        { method: 'POST', body: JSON.stringify(payload) }
      );
      login(data.token, data.user);
      onAuth?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-3">Options Tracking</h1>
              <p className="text-muted">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</p>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit} className="d-grid gap-3">
                {mode === 'register' && (
                  <input
                    className="form-control"
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                )}
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control"
                  name="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button className="btn btn-primary" type="submit">
                  {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>
              <button
                type="button"
                className="btn btn-link mt-3"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
