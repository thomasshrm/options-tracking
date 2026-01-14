import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const defaultForm = {
  symbol: "",
  positionType: "CASH_SECURED_PUT",
  direction: "SHORT",
  strikePrice: 0,
  premium: 0,
  quantity: 1,
  expirationDate: "",
  openDate: "",
};

const PositionsPage = () => {
  const { token, apiUrl } = useAuth();
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);

  const loadPositions = async () => {
    const response = await fetch(`${apiUrl}/api/positions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setPositions(data);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      ...form,
      strikePrice: Number(form.strikePrice),
      premium: Number(form.premium),
      quantity: Number(form.quantity),
    };
    const response = await fetch(`${apiUrl}/api/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Erreur lors de la création");
      return;
    }
    setForm(defaultForm);
    loadPositions();
  };

  const closePosition = async (id) => {
    await fetch(`${apiUrl}/api/positions/${id}/close`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pnlRealized: 0 }),
    });
    loadPositions();
  };

  const deletePosition = async (id) => {
    await fetch(`${apiUrl}/api/positions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadPositions();
  };

  return (
    <div>
      <h1 className="h3 mb-4">Positions</h1>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Ouvrir une position</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <label className="form-label">Ticker</label>
              <input className="form-control" name="symbol" value={form.symbol} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select className="form-select" name="positionType" value={form.positionType} onChange={handleChange}>
                <option value="CASH_SECURED_PUT">Cash Secured Put</option>
                <option value="COVERED_CALL">Covered Call</option>
                <option value="NAKED_CALL">Naked Call</option>
                <option value="NAKED_PUT">Naked Put</option>
                <option value="NAKED_PUT_SELLING">Naked Put Selling</option>
                <option value="NAKED_CALL_SELLING">Naked Call Selling</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Direction</label>
              <select className="form-select" name="direction" value={form.direction} onChange={handleChange}>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Strike</label>
              <input className="form-control" type="number" name="strikePrice" value={form.strikePrice} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Prime</label>
              <input className="form-control" type="number" name="premium" value={form.premium} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Quantité</label>
              <input className="form-control" type="number" name="quantity" value={form.quantity} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Date d'ouverture</label>
              <input className="form-control" type="date" name="openDate" value={form.openDate} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Expiration</label>
              <input className="form-control" type="date" name="expirationDate" value={form.expirationDate} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Vos positions</h5>
          {positions.length === 0 ? (
            <p className="text-muted">Aucune position.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Direction</th>
                    <th>Status</th>
                    <th>PnL réalisé</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td>{position.symbol}</td>
                      <td>{position.positionType}</td>
                      <td>{position.direction}</td>
                      <td>{position.status}</td>
                      <td>{position.pnlRealized}</td>
                      <td>
                        {position.status === "OPEN" && (
                          <button className="btn btn-sm btn-outline-success me-2" onClick={() => closePosition(position.id)}>
                            Fermer
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deletePosition(position.id)}>
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

export default PositionsPage;
