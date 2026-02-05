import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pendingRooms, setPendingRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "users") {
        const res = await axios.get("/api/admin/users");
        setUsers(res.data.data);
      } else if (activeTab === "rooms") {
        const res = await axios.get("/api/admin/rooms");
        setRooms(res.data.data);
      } else if (activeTab === "pending") {
        const res = await axios.get("/api/rooms/pending");
        setPendingRooms(res.data.data);
      } else if (activeTab === "reviews") {
        const res = await axios.get("/api/admin/reviews");
        setReviews(res.data.data);
      } else if (activeTab === "stats") {
        const res = await axios.get("/api/admin/stats/admin");
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      await axios.put(`/api/admin/users/${id}/toggle`);
      toast.success("Statut de l'utilisateur modifié");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const deleteUser = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        toast.success("Utilisateur supprimé");
        fetchData();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const approveRoom = async (id) => {
    try {
      await axios.put(`/api/rooms/${id}/approve`);
      toast.success("Salle approuvée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const rejectRoom = async (id) => {
    try {
      await axios.put(`/api/rooms/${id}/reject`);
      toast.success("Salle rejetée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const deleteRoom = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) {
      try {
        await axios.delete(`/api/rooms/${id}`);
        toast.success("Salle supprimée");
        fetchData();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      try {
        await axios.delete(`/api/admin/reviews/${id}`);
        toast.success("Avis supprimé");
        fetchData();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="container py-4">
      <h1 className="mb-4">🛡️ Administration</h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("users")}
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-outline"}`}
        >
          👥 Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`btn ${activeTab === "pending" ? "btn-primary" : "btn-outline"}`}
        >
          ⏳ En attente ({pendingRooms.length})
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`btn ${activeTab === "rooms" ? "btn-primary" : "btn-outline"}`}
        >
          🏢 Salles
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`btn ${activeTab === "reviews" ? "btn-primary" : "btn-outline"}`}
        >
          ⭐ Avis
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`btn ${activeTab === "stats" ? "btn-primary" : "btn-outline"}`}
        >
          📊 Statistiques
        </button>
      </div>

      {/* Utilisateurs */}
      {activeTab === "users" && (
        <div className="card">
          <h2>Utilisateurs ({users.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px" }}>Nom</th>
                  <th style={{ padding: "10px" }}>Email</th>
                  <th style={{ padding: "10px" }}>Rôle</th>
                  <th style={{ padding: "10px" }}>Statut</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "10px" }}>
                      {user.prenom} {user.nom}
                    </td>
                    <td style={{ padding: "10px" }}>{user.email}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-danger"
                            : user.role === "proprietaire"
                              ? "badge-primary"
                              : "badge-success"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span
                        className={`badge ${user.actif ? "badge-success" : "badge-danger"}`}
                      >
                        {user.actif ? "Actif" : "Banni"}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className="btn btn-primary"
                        style={{
                          marginRight: "10px",
                          padding: "5px 10px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {user.actif ? "🚫 Bannir" : "✅ Activer"}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="btn btn-danger"
                        style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salles en attente */}
      {activeTab === "pending" && (
        <div>
          <h2 className="mb-3">
            Salles en attente d'approbation ({pendingRooms.length})
          </h2>
          {pendingRooms.length === 0 ? (
            <div className="card text-center">
              <p>Aucune salle en attente</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {pendingRooms.map((room) => (
                <div key={room._id} className="card">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={room.titre}
                      className="card-image"
                    />
                  ) : (
                    <div
                      className="card-image"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "3rem",
                      }}
                    >
                      🏢
                    </div>
                  )}

                  <h3>{room.titre}</h3>
                  <p
                    style={{
                      color: "var(--gray)",
                      height: "60px",
                      overflow: "hidden",
                    }}
                  >
                    {room.description}
                  </p>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>Propriétaire:</strong> {room.proprietaire.prenom}{" "}
                    {room.proprietaire.nom}
                    <br />
                    <strong>Email:</strong> {room.proprietaire.email}
                    <br />
                    <strong>Localisation:</strong> {room.localisation.ville},{" "}
                    {room.localisation.codePostal}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="badge badge-primary">
                      👥 {room.capacite}
                    </span>
                    <span className="badge badge-success">
                      {room.prix}€/{room.typePrix}
                    </span>
                    {room.images && (
                      <span className="badge badge-primary">
                        📸 {room.images.length}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-3" style={{ gap: "10px" }}>
                    <a
                      href={`/room/${room._id}`}
                      className="btn btn-primary"
                      style={{ textAlign: "center", textDecoration: "none" }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      👁️ Voir
                    </a>
                    <button
                      onClick={() => approveRoom(room._id)}
                      className="btn btn-success"
                    >
                      ✅ Approuver
                    </button>
                    <button
                      onClick={() => rejectRoom(room._id)}
                      className="btn btn-danger"
                    >
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toutes les salles */}
      {activeTab === "rooms" && (
        <div>
          <h2 className="mb-3">Toutes les salles ({rooms.length})</h2>
          <div className="grid grid-3">
            {rooms.map((room) => (
              <div key={room._id} className="card">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={room.titre}
                    className="card-image"
                  />
                ) : (
                  <div
                    className="card-image"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "3rem",
                    }}
                  >
                    🏢
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{room.titre}</h3>
                  <span
                    className={`badge ${
                      room.statut === "approuve"
                        ? "badge-success"
                        : room.statut === "rejete"
                          ? "badge-danger"
                          : "badge-warning"
                    }`}
                  >
                    {room.statut}
                  </span>
                </div>

                <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                  Par: {room.proprietaire.prenom} {room.proprietaire.nom}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge badge-primary">
                    👥 {room.capacite}
                  </span>
                  <span className="badge badge-success">
                    {room.prix}€/{room.typePrix}
                  </span>
                </div>

                <button
                  onClick={() => deleteRoom(room._id)}
                  className="btn btn-danger"
                  style={{ width: "100%" }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avis */}
      {activeTab === "reviews" && (
        <div className="card">
          <h2>Tous les avis ({reviews.length})</h2>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                padding: "15px",
                background: "var(--light)",
                borderRadius: "8px",
                marginTop: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <strong>
                    {review.client.prenom} {review.client.nom}
                  </strong>
                  <span className="badge badge-warning">
                    ⭐ {review.note}/5
                  </span>
                </div>
                <p style={{ margin: "10px 0", color: "var(--dark)" }}>
                  {review.commentaire}
                </p>
                <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                  Salle: {review.salle.titre}
                </p>
                <small style={{ color: "var(--gray)" }}>
                  {new Date(review.dateCreation).toLocaleDateString("fr-FR")}
                </small>
              </div>
              <button
                onClick={() => deleteReview(review._id)}
                className="btn btn-danger"
                style={{ padding: "5px 15px" }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {activeTab === "stats" && stats && (
        <div>
          <div className="grid grid-4 mb-4">
            <div className="card text-center">
              <h3
                style={{
                  fontSize: "2.5rem",
                  color: "var(--primary)",
                  margin: "10px 0",
                }}
              >
                {stats.overview.totalUsers}
              </h3>
              <p>👥 Utilisateurs</p>
            </div>
            <div className="card text-center">
              <h3
                style={{
                  fontSize: "2.5rem",
                  color: "var(--success)",
                  margin: "10px 0",
                }}
              >
                {stats.overview.totalRooms}
              </h3>
              <p>🏢 Salles</p>
            </div>
            <div className="card text-center">
              <h3
                style={{
                  fontSize: "2.5rem",
                  color: "var(--warning)",
                  margin: "10px 0",
                }}
              >
                {stats.overview.totalBookings}
              </h3>
              <p>📅 Réservations</p>
            </div>
            <div className="card text-center">
              <h3
                style={{
                  fontSize: "2.5rem",
                  color: "var(--danger)",
                  margin: "10px 0",
                }}
              >
                {stats.overview.totalRevenue}€
              </h3>
              <p>💰 Revenus</p>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3>Utilisateurs par rôle</h3>
              {stats.usersByRole.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                  }}
                >
                  <span>{item._id}</span>
                  <span className="badge badge-primary">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Réservations par statut</h3>
              {stats.bookingsByStatus.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                  }}
                >
                  <span>{item._id}</span>
                  <span className="badge badge-primary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.overview.pendingRooms > 0 && (
            <div className="alert alert-warning mt-4">
              ⚠️ Vous avez <strong>{stats.overview.pendingRooms}</strong>{" "}
              salle(s) en attente d'approbation
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
