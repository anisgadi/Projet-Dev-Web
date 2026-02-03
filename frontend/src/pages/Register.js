import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
    telephone: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      toast.success("Inscription réussie !");
      navigate("/");
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card">
          <h2 className="mb-4 text-center">Inscription</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  className="form-control"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  className="form-control"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                className="form-control"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input
                type="text"
                name="adresse"
                className="form-control"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Je suis un(e) *</label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="client">Client (réserver des salles)</option>
                <option value="proprietaire">
                  Propriétaire (proposer des salles)
                </option>
              </select>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-center mt-3">
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: "var(--primary)" }}>
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
