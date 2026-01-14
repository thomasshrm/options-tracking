import { useEffect, useState } from "react";
import { request } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  symbol: "",
  positionType: "CASH_SECURED_PUT",
  direction: "LONG",
  strikePrice: 0,
  premium: 0,
  quantity: 1,
  expirationDate: "",
  openDate: "",
  closeDate: "",
  status: "OPEN",
  pnlRealized: 0,
  pnlUnrealized: 0
};

const Positions = () => {
  const { token } = useAuth();
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const loadPositions = async () => {
    try {
      const data = await request("/positions", { token });
      setPositions(data.positions);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await request("/positions", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...form,
          strikePrice: Number(form.strikePrice),
          premium: Number(form.premium),
          quantity: Number(form.quantity),
          pnlRealized: Number(form.pnlRealized),
          pnlUnrealized: Number(form.pnlUnrealized),
          closeDate: form.closeDate || null
        })
      });
      setForm(initialForm);
      loadPositions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5">Nouvelle position</h2>
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Symbole</label>
              <input
                className="form-control"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
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
            <div className="col-md-4">
              <label className="form-label">Direction</label>
              <select className="form-select" name="direction" value={form.direction} onChange={handleChange}>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Strike</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                name="strikePrice"
                value={form.strikePrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Prime</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                name="premium"
                value={form.premium}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Quantité</label>
              <input
                className="form-control"
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date d'ouverture</label>
              <input
                className="form-control"
                type="date"
                name="openDate"
                value={form.openDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date d'expiration</label>
              <input
                className="form-control"
                type="date"
                name="expirationDate"
                value={form.expirationDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">PnL réalisé</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                name="pnlRealized"
                value={form.pnlRealized}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">PnL non réalisé</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                name="pnlUnrealized"
                value={form.pnlUnrealized}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date de clôture (optionnel)</label>
              <input
                className="form-control"
                type="date"
                name="closeDate"
                value={form.closeDate}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">
                Ajouter la position
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5">Positions enregistrées</h2>
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Symbole</th>
                  <th>Type</th>
                  <th>Direction</th>
                  <th>Strike</th>
                  <th>Prime</th>
                  <th>Quantité</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      Aucune position pour le moment.
                    </td>
                  </tr>
                )}
                {positions.map((position) => (
                  <tr key={position.id}>
                    <td>{position.symbol}</td>
                    <td>{position.positionType}</td>
                    <td>{position.direction}</td>
                    <td>{Number(position.strikePrice).toFixed(2)}</td>
                    <td>{Number(position.premium).toFixed(2)}</td>
                    <td>{position.quantity}</td>
                    <td>{position.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Positions;
