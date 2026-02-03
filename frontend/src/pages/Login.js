import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success("Connexion réussie !");

      // Rediriger selon le rôle
      if (result.user.role === "client") {
        navigate("/");
      } else if (result.user.role === "proprietaire") {
        navigate("/owner/dashboard");
      } else if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div
        className="grid grid-2"
        style={{ maxWidth: "900px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</h1>
            <h2>Bienvenue sur RoomBooking</h2>
            <p style={{ color: "var(--gray)", marginTop: "1rem" }}>
              La plateforme de réservation de salles la plus simple et efficace
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Connexion</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center mt-3">
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: "var(--primary)" }}>
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
