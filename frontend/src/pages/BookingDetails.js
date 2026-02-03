import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import GoogleMapComponent from "../components/GoogleMapComponent";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    note: 5,
    commentaire: "",
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`/api/bookings/${id}`);
      setBooking(res.data.data);

      // Vérifier si l'utilisateur a déjà laissé un avis
      if (res.data.data.salle && res.data.data.salle.avis) {
        const userReview = res.data.data.salle.avis.find(
          (avis) => avis.reservation === id,
        );
        setHasReviewed(!!userReview);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de la réservation");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const isBookingFinished = () => {
    return new Date(booking.dateFin) < new Date();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isBookingFinished()) {
      toast.error(
        "Vous pouvez laisser un avis uniquement après la fin de la réservation",
      );
      return;
    }

    try {
      await axios.post("/api/reviews", {
        salle: booking.salle._id,
        reservation: booking._id,
        note: parseInt(reviewForm.note),
        commentaire: reviewForm.commentaire,
      });

      toast.success("Avis publié avec succès !");
      setShowReviewForm(false);
      setHasReviewed(true);
      fetchBooking();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la publication de l'avis",
      );
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? "#f59e0b" : "#e5e7eb",
          fontSize: interactive ? "2rem" : "1.2rem",
          cursor: interactive ? "pointer" : "default",
        }}
        onClick={() => interactive && onRate && onRate(index + 1)}
      >
        ★
      </span>
    ));
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

  const getStatusBadge = (status) => {
    const badges = {
      confirmee: { class: "badge-success", text: "Confirmée" },
      en_attente: { class: "badge-warning", text: "En attente" },
      annulee: { class: "badge-danger", text: "Annulée" },
      terminee: { class: "badge-primary", text: "Terminée" },
    };
    return badges[status] || { class: "badge-primary", text: status };
  };

  const calculateDuration = () => {
    const debut = new Date(booking.dateDebut);
    const fin = new Date(booking.dateFin);
    const diffMs = fin - debut;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? "s" : ""} ${diffHours % 24}h`;
    }
    return `${diffHours}h`;
  };

  const getCoordinates = () => {
    if (!booking || !booking.salle || !booking.salle.localisation) return null;

    const loc = booking.salle.localisation;
    if (loc.coordinates?.coordinates) {
      return {
        lat: loc.coordinates.coordinates[1],
        lng: loc.coordinates.coordinates[0],
      };
    }

    if (loc.latitude && loc.longitude) {
      return {
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
      };
    }

    return null;
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  if (!booking)
    return (
      <div className="container py-4">
        <p>Réservation non trouvée</p>
      </div>
    );

  const status = getStatusBadge(booking.statut);
  const coordinates = getCoordinates();
  const bookingFinished = isBookingFinished();

  return (
    <div className="container py-4">
      <Link to="/my-bookings" className="btn btn-outline mb-3">
        ← Retour à mes réservations
      </Link>

      <div className="card mb-4">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <h1>Détails de la réservation</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <span
              className={`badge ${status.class}`}
              style={{ fontSize: "1rem", padding: "8px 16px" }}
            >
              {status.text}
            </span>
            {bookingFinished && (
              <span className="badge badge-primary">📅 Période terminée</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          {/* Informations de la salle */}
          <div className="card">
            <h2>🏢 Salle réservée</h2>

            {booking.salle.images && booking.salle.images.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  marginTop: "15px",
                }}
              >
                {booking.salle.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${booking.salle.titre} ${index + 1}`}
                    style={{
                      width: "200px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/200x150?text=Image+non+disponible";
                    }}
                  />
                ))}
              </div>
            )}

            <h3 style={{ marginTop: "20px" }}>{booking.salle.titre}</h3>
            <p style={{ color: "var(--gray)" }}>{booking.salle.description}</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                flexWrap: "wrap",
              }}
            >
              <span className="badge badge-primary">
                👥 Capacité: {booking.salle.capacite} pers.
              </span>
              <span className="badge badge-success">
                💰 {booking.salle.prix}€/{booking.salle.typePrix}
              </span>
              {booking.salle.noteMoyenne > 0 && (
                <span className="badge badge-warning">
                  ⭐ {booking.salle.noteMoyenne.toFixed(1)}/5
                </span>
              )}
            </div>

            {booking.salle.equipements &&
              booking.salle.equipements.length > 0 && (
                <>
                  <h4 className="mt-3">Équipements</h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {booking.salle.equipements.map((eq, index) => (
                      <span key={index} className="badge badge-primary">
                        {eq}
                      </span>
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* Localisation */}
          {coordinates && (
            <div className="card mt-3">
              <h3>📍 Localisation</h3>
              <GoogleMapComponent
                rooms={[booking.salle]}
                center={coordinates}
                zoom={15}
                height="300px"
              />
              <p className="mt-2">
                {booking.salle.localisation.adresse},{" "}
                {booking.salle.localisation.ville}{" "}
                {booking.salle.localisation.codePostal}
              </p>
            </div>
          )}
        </div>

        <div>
          {/* Détails de la réservation */}
          <div className="card">
            <h3>📅 Période de réservation</h3>
            <div
              style={{
                background: "var(--light)",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            >
              <p>
                <strong>Début:</strong>
                <br />
                {formatDate(booking.dateDebut)}
              </p>
              <p style={{ marginTop: "15px" }}>
                <strong>Fin:</strong>
                <br />
                {formatDate(booking.dateFin)}
              </p>
              <p style={{ marginTop: "15px" }}>
                <strong>Durée:</strong> {calculateDuration()}
              </p>
              <p style={{ marginTop: "15px" }}>
                <strong>Nombre de personnes:</strong> {booking.nombrePersonnes}
              </p>
              <p
                style={{
                  marginTop: "15px",
                  fontSize: "1.3rem",
                  color: "var(--primary)",
                }}
              >
                <strong>Prix total: {booking.prixTotal}€</strong>
              </p>
            </div>
          </div>

          {/* Propriétaire */}
          <div className="card mt-3">
            <h3>👤 Propriétaire</h3>
            <p>
              <strong>
                {booking.salle.proprietaire.prenom}{" "}
                {booking.salle.proprietaire.nom}
              </strong>
            </p>
            {booking.salle.proprietaire.telephone && (
              <p>📞 {booking.salle.proprietaire.telephone}</p>
            )}
            {booking.salle.proprietaire.email && (
              <p>📧 {booking.salle.proprietaire.email}</p>
            )}
          </div>

          {/* Avis - Seulement si la réservation est terminée */}
          {bookingFinished && (
            <div className="card mt-3">
              <h3>⭐ Votre avis</h3>

              {hasReviewed ? (
                <div className="alert alert-success mt-2">
                  ✓ Vous avez déjà laissé un avis pour cette réservation
                </div>
              ) : showReviewForm ? (
                <form onSubmit={handleReviewSubmit} className="mt-3">
                  <div className="form-group">
                    <label className="form-label">Note *</label>
                    <div>
                      {renderStars(reviewForm.note, true, (rating) =>
                        setReviewForm({ ...reviewForm, note: rating }),
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Commentaire *</label>
                    <textarea
                      className="form-control"
                      value={reviewForm.commentaire}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          commentaire: e.target.value,
                        })
                      }
                      required
                      rows="4"
                      placeholder="Partagez votre expérience..."
                    />
                  </div>

                  <div className="grid grid-2">
                    <button type="submit" className="btn btn-primary">
                      Publier l'avis
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="btn btn-outline"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn btn-primary mt-2"
                  style={{ width: "100%" }}
                >
                  ✍️ Donner mon avis
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="card mt-3">
            <h3>Actions</h3>
            <Link
              to={`/room/${booking.salle._id}`}
              className="btn btn-primary mt-2"
              style={{
                width: "100%",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              🔄 Réserver encore une fois
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
