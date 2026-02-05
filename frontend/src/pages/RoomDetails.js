import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import GoogleMapComponent from "../components/GoogleMapComponent";
import ImageLightbox from "../components/ImageLightbox";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    dateDebut: "",
    dateFin: "",
    nombrePersonnes: 1,
  });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const data = await getRoom(id);
      setRoom(data.data);
    } catch (error) {
      toast.error("Erreur lors du chargement de la salle");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour réserver");
      navigate("/login");
      return;
    }

    if (user?.role !== "client") {
      toast.error("Seuls les clients peuvent réserver des salles");
      return;
    }

    const now = new Date();
    const debut = new Date(bookingForm.dateDebut);
    const fin = new Date(bookingForm.dateFin);

    if (debut < now) {
      toast.error("La date de début ne peut pas être dans le passé");
      return;
    }

    if (fin <= debut) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    try {
      await createBooking({
        salle: id,
        ...bookingForm,
      });
      toast.success(
        "Demande de réservation envoyée ! En attente d'approbation du propriétaire.",
      );
      setBookingForm({ dateDebut: "", dateFin: "", nombrePersonnes: 1 });
      navigate("/my-bookings");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la réservation");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? "#f59e0b" : "#e5e7eb",
          fontSize: "1.2rem",
        }}
      >
        ★
      </span>
    ));
  };

  const getCoordinates = () => {
    if (!room || !room.localisation) return null;

    if (room.localisation.coordinates?.coordinates) {
      return {
        lat: room.localisation.coordinates.coordinates[1],
        lng: room.localisation.coordinates.coordinates[0],
      };
    }

    if (room.localisation.latitude && room.localisation.longitude) {
      return {
        lat: parseFloat(room.localisation.latitude),
        lng: parseFloat(room.localisation.longitude),
      };
    }

    return null;
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setShowLightbox(true);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  if (!room)
    return (
      <div className="container py-4">
        <p>Salle non trouvée</p>
      </div>
    );

  const images =
    room.images && room.images.length > 0
      ? room.images
      : ["https://via.placeholder.com/800x400?text=Aucune+Image"];

  const coordinates = getCoordinates();

  return (
    <div className="container py-4">
      {showLightbox && (
        <ImageLightbox
          images={images}
          currentIndex={selectedImage}
          onClose={() => setShowLightbox(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}

      <div className="grid grid-2">
        <div>
          {/* Galerie d'images */}
          <div className="card">
            <img
              src={images[selectedImage]}
              alt={room.titre}
              onClick={() => handleImageClick(selectedImage)}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover",
                borderRadius: "8px",
                cursor: "zoom-in",
              }}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Image+non+disponible";
              }}
            />

            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  overflowX: "auto",
                }}
              >
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${room.titre} ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100?text=?";
                    }}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border:
                        selectedImage === index
                          ? "3px solid var(--primary)"
                          : "3px solid transparent",
                      opacity: selectedImage === index ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Carte */}
          {coordinates && (
            <div className="card mt-3">
              <h3>📍 Localisation</h3>
              <GoogleMapComponent
                rooms={[room]}
                center={coordinates}
                zoom={15}
                height="300px"
              />
              <p className="mt-2">
                {room.localisation.adresse}, {room.localisation.ville}{" "}
                {room.localisation.codePostal}
              </p>
            </div>
          )}

          {/* Détails */}
          <div className="card mt-3">
            <h2>{room.titre}</h2>
            <p>{room.description}</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <span className="badge badge-primary">
                👥 {room.capacite} personnes
              </span>
              <span className="badge badge-success">
                {room.prix}€/{room.typePrix}
              </span>
              {room.noteMoyenne > 0 && (
                <span className="badge badge-warning">
                  ⭐ {room.noteMoyenne.toFixed(1)} ({room.nombreAvis} avis)
                </span>
              )}
            </div>

            {room.equipements && room.equipements.length > 0 && (
              <>
                <h3 className="mt-4">🛠️ Équipements</h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {room.equipements.map((eq, index) => (
                    <span key={index} className="badge badge-primary">
                      {eq}
                    </span>
                  ))}
                </div>
              </>
            )}

            <h3 className="mt-4">👤 Propriétaire</h3>
            <p>
              {room.proprietaire.prenom} {room.proprietaire.nom}
            </p>
            {room.proprietaire.telephone && (
              <p>📞 {room.proprietaire.telephone}</p>
            )}
          </div>

          {/* Avis */}
          <div className="card mt-3">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>⭐ Avis des clients</h3>
                {room.nombreAvis > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem" }}>
                      {renderStars(Math.round(room.noteMoyenne))}
                    </div>
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "var(--primary)",
                      }}
                    >
                      {room.noteMoyenne.toFixed(1)}/5
                    </span>
                    <span style={{ marginLeft: "10px", color: "var(--gray)" }}>
                      ({room.nombreAvis} avis)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {room.avis && room.avis.length > 0 ? (
              <div style={{ marginTop: "20px" }}>
                {room.avis.map((avis) => (
                  <div
                    key={avis._id}
                    style={{
                      padding: "20px",
                      background: "var(--light)",
                      borderRadius: "8px",
                      marginTop: "15px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "1.1rem" }}>
                          {avis.client.prenom} {avis.client.nom}
                        </strong>
                        <div style={{ marginTop: "5px" }}>
                          {renderStars(avis.note)}
                        </div>
                      </div>
                      <small style={{ color: "var(--gray)" }}>
                        {new Date(avis.dateCreation).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </small>
                    </div>
                    <p
                      style={{
                        marginTop: "15px",
                        color: "var(--dark)",
                        lineHeight: "1.6",
                      }}
                    >
                      {avis.commentaire}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="mt-3"
                style={{
                  color: "var(--gray)",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Aucun avis pour le moment. Soyez le premier à donner votre avis
                !
              </p>
            )}
          </div>
        </div>

        {/* Formulaire de réservation */}
        <div>
          <div className="card" style={{ position: "sticky", top: "100px" }}>
            <h3>Réserver cette salle</h3>

            {!isAuthenticated ? (
              <div className="alert alert-info mt-3">
                Vous devez être{" "}
                <a href="/login" style={{ color: "var(--primary)" }}>
                  connecté
                </a>{" "}
                pour réserver cette salle
              </div>
            ) : user?.role !== "client" ? (
              <div className="alert alert-info mt-3">
                Seuls les clients peuvent réserver des salles
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-3">
                <div className="form-group">
                  <label className="form-label">Date de début *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    min={getMinDateTime()}
                    value={bookingForm.dateDebut}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        dateDebut: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date de fin *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    min={bookingForm.dateDebut || getMinDateTime()}
                    value={bookingForm.dateFin}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        dateFin: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de personnes *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={room.capacite}
                    value={bookingForm.nombrePersonnes}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        nombrePersonnes: e.target.value,
                      })
                    }
                    required
                  />
                  <small style={{ color: "var(--gray)" }}>
                    Maximum: {room.capacite} personnes
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Envoyer une demande de réservation
                </button>

                <small
                  style={{
                    display: "block",
                    marginTop: "10px",
                    color: "var(--gray)",
                    textAlign: "center",
                  }}
                >
                  Le propriétaire devra approuver votre demande
                </small>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
