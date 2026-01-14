import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

const emptyForm = {
  symbol: '',
  positionType: 'CASH_SECURED_PUT',
  direction: 'SHORT',
  strikePrice: 0,
  premium: 0,
  quantity: 1,
  expirationDate: '',
  openDate: '',
  status: 'OPEN',
  pnlRealized: 0,
  pnlUnrealized: 0
};

const Positions = ({ token, onError }) => {
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadPositions = () => {
    apiRequest('/api/positions', { token })
      .then(setPositions)
      .catch((err) => onError?.(err.message));
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name.includes('Date') ? value : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      strikePrice: Number(form.strikePrice),
      premium: Number(form.premium),
      quantity: Number(form.quantity),
      pnlRealized: Number(form.pnlRealized),
      pnlUnrealized: Number(form.pnlUnrealized)
    };
    try {
      if (editingId) {
        await apiRequest(`/api/positions/${editingId}`, {
          token,
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/positions', {
          token,
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      loadPositions();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const handleEdit = (position) => {
    setEditingId(position.id);
    setForm({
      symbol: position.symbol,
      positionType: position.positionType,
      direction: position.direction,
      strikePrice: position.strikePrice,
      premium: position.premium,
      quantity: position.quantity,
      expirationDate: position.expirationDate,
      openDate: position.openDate,
      status: position.status,
      pnlRealized: position.pnlRealized,
      pnlUnrealized: position.pnlUnrealized
    });
  };

  const handleClose = async (id) => {
    try {
      await apiRequest(`/api/positions/${id}/close`, { token, method: 'POST' });
      loadPositions();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/api/positions/${id}`, { token, method: 'DELETE' });
      loadPositions();
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">{editingId ? 'Modifier une position' : 'Nouvelle position'}</h5>
            <form onSubmit={handleSubmit} className="d-grid gap-2">
              <input className="form-control" name="symbol" placeholder="Ticker" value={form.symbol} onChange={handleChange} required />
              <select className="form-select" name="positionType" value={form.positionType} onChange={handleChange}>
                <option value="CASH_SECURED_PUT">Cash Secured Put</option>
                <option value="COVERED_CALL">Covered Call</option>
                <option value="NAKED_CALL">Naked Call</option>
                <option value="NAKED_PUT">Naked Put</option>
                <option value="NAKED_PUT_SELLING">Naked Put Selling</option>
                <option value="NAKED_CALL_SELLING">Naked Call Selling</option>
              </select>
              <select className="form-select" name="direction" value={form.direction} onChange={handleChange}>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
              <div className="row g-2">
                <div className="col-6">
                  <input className="form-control" name="strikePrice" type="number" step="0.01" value={form.strikePrice} onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <input className="form-control" name="premium" type="number" step="0.01" value={form.premium} onChange={handleChange} required />
                </div>
              </div>
              <input className="form-control" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
              <input className="form-control" name="openDate" type="date" value={form.openDate} onChange={handleChange} required />
              <input className="form-control" name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} required />
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
              <div className="row g-2">
                <div className="col-6">
                  <input className="form-control" name="pnlRealized" type="number" step="0.01" value={form.pnlRealized} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <input className="form-control" name="pnlUnrealized" type="number" step="0.01" value={form.pnlUnrealized} onChange={handleChange} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingId && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Annuler</button>
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Positions existantes</h5>
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Symbole</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>PnL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td>{position.symbol}</td>
                      <td>{position.positionType}</td>
                      <td>{position.status}</td>
                      <td>{Number(position.pnlRealized).toFixed(2)} €</td>
                      <td className="d-flex flex-wrap gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(position)}>Modifier</button>
                        {position.status === 'OPEN' && (
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleClose(position.id)}>Fermer</button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(position.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {positions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">Aucune position enregistrée.</td>
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

export default Positions;
