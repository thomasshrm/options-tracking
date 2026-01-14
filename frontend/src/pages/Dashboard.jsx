import { useEffect, useState } from "react";
import { request } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await request("/dashboard", { token });
        setData(payload);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data) {
    return <div className="text-muted">Chargement du dashboard...</div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">PnL total</h6>
              <h3>{data.totals.pnlTotal.toFixed(2)} €</h3>
              <p className="mb-0 text-muted">
                Réalisé: {data.totals.pnlRealized.toFixed(2)} € | Non réalisé:{" "}
                {data.totals.pnlUnrealized.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Positions ouvertes</h6>
              <h3>{data.openPositions}</h3>
              <p className="mb-0 text-muted">Win rate: {data.winRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">PnL par mois</h6>
              <ul className="list-unstyled mb-0">
                {data.pnlByMonth.length === 0 && <li>Aucune donnée</li>}
                {data.pnlByMonth.map((row) => (
                  <li key={row.month}>
                    {row.month}: {Number(row.pnl).toFixed(2)} €
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="text-muted">Répartition par stratégie</h6>
          <div className="row">
            {data.strategyDistribution.length === 0 && <div>Aucune position.</div>}
            {data.strategyDistribution.map((row) => (
              <div className="col-md-4" key={row.type}>
                <strong>{row.type}</strong>: {row.count}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
