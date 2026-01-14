import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

const Dashboard = ({ token, onError }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiRequest('/api/dashboard', { token })
      .then(setData)
      .catch((err) => onError?.(err.message));
  }, [token, onError]);

  if (!data) {
    return <div className="alert alert-info">Chargement du dashboard...</div>;
  }

  return (
    <div className="row g-3">
      <div className="col-md-3">
        <div className="card text-bg-light h-100">
          <div className="card-body">
            <h6 className="text-uppercase text-muted">PnL Total</h6>
            <h3 className="mb-0">{data.pnlTotal.toFixed(2)} €</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-light h-100">
          <div className="card-body">
            <h6 className="text-uppercase text-muted">Positions ouvertes</h6>
            <h3 className="mb-0">{data.openPositions}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-light h-100">
          <div className="card-body">
            <h6 className="text-uppercase text-muted">Win rate</h6>
            <h3 className="mb-0">{Math.round(data.winRate * 100)}%</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-bg-light h-100">
          <div className="card-body">
            <h6 className="text-uppercase text-muted">PnL Réalisé</h6>
            <h3 className="mb-0">{data.pnlRealized.toFixed(2)} €</h3>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="card h-100">
          <div className="card-body">
            <h5>Répartition des stratégies</h5>
            <ul className="list-group list-group-flush">
              {data.strategies.map((item) => (
                <li key={item.type} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.type}</span>
                  <span className="badge text-bg-primary">{item.count}</span>
                </li>
              ))}
              {data.strategies.length === 0 && (
                <li className="list-group-item text-muted">Aucune position encore.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="card h-100">
          <div className="card-body">
            <h5>PnL par mois</h5>
            <ul className="list-group list-group-flush">
              {data.pnlByMonth.map((item) => (
                <li key={item.month} className="list-group-item d-flex justify-content-between">
                  <span>{item.month}</span>
                  <span>{Number(item.pnl).toFixed(2)} €</span>
                </li>
              ))}
              {data.pnlByMonth.length === 0 && (
                <li className="list-group-item text-muted">Pas encore de données.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
