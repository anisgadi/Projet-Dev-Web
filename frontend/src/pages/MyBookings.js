import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      try {
        await cancelBooking(id);
        toast.success("Réservation annulée");
        fetchBookings();
      } catch (error) {
        toast.error("Erreur lors de l'annulation");
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmee: "badge-success",
      en_attente: "badge-warning",
      annulee: "badge-danger",
      terminee: "badge-primary",
    };
    return badges[status] || "badge-primary";
  };

  const getStatusText = (status) => {
    const texts = {
      confirmee: "Confirmée",
      en_attente: "En attente",
      annulee: "Annulée",
      terminee: "Terminée",
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isBookingFinished = (booking) => {
    return new Date(booking.dateFin) < new Date();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Mes Réservations ({bookings.length})</h1>

      {bookings.length === 0 ? (
        <div className="card text-center">
          <p>Vous n'avez aucune réservation pour le moment.</p>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ marginTop: "20px" }}
          >
            Découvrir les salles
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {bookings.map((booking) => {
            if (!booking.salle) return null;

            const isFinished = isBookingFinished(booking);

            return (
              <div key={booking._id} className="card">
                {booking.salle.images && booking.salle.images.length > 0 && (
                  <img
                    src={booking.salle.images[0]}
                    alt={booking.salle.titre}
                    className="card-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Image+non+disponible";
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: "5px" }}>
                      {booking.salle.titre}
                    </h3>
                    <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                      📍{" "}
                      {booking.salle.localisation?.ville ||
                        "Ville non spécifiée"}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      alignItems: "flex-end",
                    }}
                  >
                    <span className={`badge ${getStatusBadge(booking.statut)}`}>
                      {getStatusText(booking.statut)}
                    </span>
                    {isFinished && (
                      <span
                        className="badge badge-primary"
                        style={{ fontSize: "0.75rem" }}
                      >
                        📅 Période terminée
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--light)",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    <strong>📅 Du:</strong> {formatDate(booking.dateDebut)}
                  </p>
                  <p>
                    <strong>📅 Au:</strong> {formatDate(booking.dateFin)}
                  </p>
                  <p>
                    <strong>👥 Personnes:</strong> {booking.nombrePersonnes}
                  </p>
                  <p>
                    <strong>💰 Prix total:</strong> {booking.prixTotal}€
                  </p>
                </div>

                <div className="grid grid-2" style={{ gap: "10px" }}>
                  <Link
                    to={`/booking/${booking._id}`}
                    className="btn btn-primary"
                    style={{ textAlign: "center", textDecoration: "none" }}
                  >
                    📋 Détails de la réservation
                  </Link>
                  {booking.statut === "confirmee" && !isFinished && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="btn btn-danger"
                    >
                      ❌ Annuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
