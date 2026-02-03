import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          🏢 RoomBooking
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/">Accueil</Link>
          </li>

          {isAuthenticated ? (
            <>
              {user?.role === "client" && (
                <li>
                  <Link to="/my-bookings">Mes Réservations</Link>
                </li>
              )}

              {user?.role === "proprietaire" && (
                <li>
                  <Link to="/owner/dashboard">Tableau de Bord</Link>
                </li>
              )}

              {user?.role === "admin" && (
                <li>
                  <Link to="/admin/dashboard">Administration</Link>
                </li>
              )}

              <li>
                <span style={{ color: "var(--gray)", marginRight: "10px" }}>
                  {user?.prenom} {user?.nom}
                </span>
              </li>

              <li>
                <button onClick={handleLogout} className="btn btn-outline">
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn btn-outline">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary">
                  Inscription
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
