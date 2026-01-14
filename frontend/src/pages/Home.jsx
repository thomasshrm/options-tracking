import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="row align-items-center g-4">
      <div className="col-lg-6">
        <h1 className="fw-bold">Suivez vos positions options en un coup d'œil</h1>
        <p className="lead text-muted">
          Une plateforme simple pour gérer vos stratégies d'options, mesurer votre PnL et
          conserver votre historique de trading.
        </p>
        {user ? (
          <Link className="btn btn-primary" to="/dashboard">
            Accéder au dashboard
          </Link>
        ) : (
          <div className="d-flex gap-2">
            <Link className="btn btn-primary" to="/register">
              Créer un compte
            </Link>
            <Link className="btn btn-outline-secondary" to="/login">
              Se connecter
            </Link>
          </div>
        )}
      </div>
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">MVP inclus</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Gestion des positions options</li>
              <li className="list-group-item">Dashboard de performance</li>
              <li className="list-group-item">Administration des utilisateurs</li>
              <li className="list-group-item">Authentification sécurisée</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
