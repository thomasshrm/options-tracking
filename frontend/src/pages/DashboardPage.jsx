import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const DashboardPage = () => {
  const { token, apiUrl } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = async () => {
    const response = await fetch(`${apiUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setDashboard(data);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!dashboard) {
    return <div className="alert alert-info">Chargement du dashboard...</div>;
  }

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard</h1>
      <div className="row g-3">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">PnL total</h6>
              <h3>{dashboard.totalPnl} €</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Positions ouvertes</h6>
              <h3>{dashboard.openPositions}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Win rate</h6>
              <h3>{dashboard.winRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title">Répartition par stratégie</h5>
          {Object.keys(dashboard.strategyBreakdown).length === 0 ? (
            <p className="text-muted">Aucune position enregistrée.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {Object.entries(dashboard.strategyBreakdown).map(([key, value]) => (
                <li key={key} className="list-group-item d-flex justify-content-between">
                  <span>{key}</span>
                  <span className="badge bg-primary rounded-pill">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
