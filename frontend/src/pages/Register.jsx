import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/api.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setSuccess("Compte créé avec succès. Vous pouvez vous connecter.");
      setForm({ email: "", username: "", password: "" });
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h4 mb-3">Inscription</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="username">
                  Nom d'utilisateur
                </label>
                <input
                  className="form-control"
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  className="form-control"
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer un compte"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
