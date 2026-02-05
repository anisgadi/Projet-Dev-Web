import React, { useState, useEffect } from "react";
import {
  getOwnerRooms,
  createRoom,
  deleteRoom,
  updateRoom,
} from "../services/roomService";
import axios from "axios";
import { toast } from "react-toastify";
import GoogleMapComponent from "../components/GoogleMapComponent";

const OwnerDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 36.7167, lng: 4.05 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRoomBookings, setSelectedRoomBookings] = useState(null);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    capacite: "",
    prix: "",
    typePrix: "heure",
    localisation: {
      adresse: "",
      ville: "",
      codePostal: "",
    },
    equipements: "",
    images: [],
  });

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getOwnerRooms();
      setRooms(data.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings/owner-bookings");
      setBookings(res.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des réservations");
    }
  };

  const getPendingBookingsCount = (roomId) => {
    return bookings.filter(
      (booking) =>
        booking.salle._id === roomId && booking.statut === "en_attente",
    ).length;
  };

  const getRoomBookings = (roomId) => {
    return bookings.filter((booking) => booking.salle._id === roomId);
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/approve`);
      toast.success("Réservation approuvée");
      fetchBookings();
      if (selectedRoomBookings) {
        setSelectedRoomBookings({
          ...selectedRoomBookings,
          bookings: getRoomBookings(selectedRoomBookings.roomId),
        });
      }
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleRefuseBooking = async (bookingId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir refuser cette réservation ?")
    ) {
      try {
        await axios.put(`/api/bookings/${bookingId}/refuse`);
        toast.success("Réservation refusée");
        fetchBookings();
        if (selectedRoomBookings) {
          setSelectedRoomBookings({
            ...selectedRoomBookings,
            bookings: getRoomBookings(selectedRoomBookings.roomId),
          });
        }
      } catch (error) {
        toast.error("Erreur lors du refus");
      }
    }
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);

    // Géocodage inversé pour obtenir l'adresse
    try {
      const res = await axios.get(
        `/api/geocoding/reverse?lat=${location.lat}&lng=${location.lng}`,
      );
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          localisation: {
            adresse: res.data.data.adresseComplete,
            ville: res.data.data.ville,
            codePostal: res.data.data.codePostal,
          },
        }));
        toast.success(`Adresse trouvée: ${res.data.data.adresseComplete}`);
      }
    } catch (error) {
      toast.error("Impossible de récupérer l'adresse");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 5) {
      toast.error("Maximum 5 images autorisées");
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append("images", file);
      });

      const res = await axios.post("/api/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...res.data.data],
      }));

      toast.success(`${res.data.data.length} image(s) uploadée(s) avec succès`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'upload des images",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      toast.error("Veuillez sélectionner une localisation sur la carte");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Veuillez ajouter au moins une photo");
      return;
    }

    try {
      const roomData = {
        ...formData,
        equipements: formData.equipements
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e),
        localisation: {
          ...formData.localisation,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        },
      };

      if (editingRoom) {
        await updateRoom(editingRoom._id, roomData);
        toast.success("Salle modifiée avec succès");
      } else {
        await createRoom(roomData);
        toast.success("Salle créée avec succès");
      }

      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);

    const coords = room.localisation.coordinates?.coordinates
      ? {
          lat: room.localisation.coordinates.coordinates[1],
          lng: room.localisation.coordinates.coordinates[0],
        }
      : room.localisation.latitude && room.localisation.longitude
        ? {
            lat: parseFloat(room.localisation.latitude),
            lng: parseFloat(room.localisation.longitude),
          }
        : null;

    setSelectedLocation(coords);
    if (coords) {
      setMapCenter(coords);
    }

    setFormData({
      titre: room.titre,
      description: room.description,
      capacite: room.capacite,
      prix: room.prix,
      typePrix: room.typePrix,
      localisation: {
        adresse: room.localisation.adresse,
        ville: room.localisation.ville,
        codePostal: room.localisation.codePostal,
      },
      equipements: room.equipements.join(", "),
      images: room.images || [],
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) {
      try {
        await deleteRoom(id);
        toast.success("Salle supprimée");
        fetchRooms();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      capacite: "",
      prix: "",
      typePrix: "heure",
      localisation: {
        adresse: "",
        ville: "",
        codePostal: "",
      },
      equipements: "",
      images: [],
    });
    setSelectedLocation(null);
    setShowForm(false);
    setEditingRoom(null);
  };

  const getStatusBadge = (room) => {
    if (room.statut === "approuve")
      return <span className="badge badge-success">✓ Approuvée</span>;
    if (room.statut === "rejete")
      return <span className="badge badge-danger">✗ Rejetée</span>;
    return <span className="badge badge-warning">⏳ En attente</span>;
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

  const getBookingStatusBadge = (status) => {
    const badges = {
      confirmee: "badge-success",
      en_attente: "badge-warning",
      annulee: "badge-danger",
      refusee: "badge-danger",
    };
    return badges[status] || "badge-primary";
  };

  const getBookingStatusText = (status) => {
    const texts = {
      confirmee: "Confirmée",
      en_attente: "En attente",
      annulee: "Annulée",
      refusee: "Refusée",
    };
    return texts[status] || status;
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="container py-4">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Mes Salles ({rooms.length})</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Annuler" : "➕ Ajouter une salle"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h2>
            {editingRoom ? "Modifier la salle" : "Ajouter une nouvelle salle"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="form-group">
              <label className="form-label">Titre *</label>
              <input
                type="text"
                className="form-control"
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows="4"
              />
            </div>

            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Capacité *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.capacite}
                  onChange={(e) =>
                    setFormData({ ...formData, capacite: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.prix}
                  onChange={(e) =>
                    setFormData({ ...formData, prix: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de prix *</label>
                <select
                  className="form-control"
                  value={formData.typePrix}
                  onChange={(e) =>
                    setFormData({ ...formData, typePrix: e.target.value })
                  }
                >
                  <option value="heure">Par heure</option>
                  <option value="jour">Par jour</option>
                  <option value="semaine">Par semaine</option>
                </select>
              </div>
            </div>

            <h3 className="mt-4">📍 Localisation</h3>
            <div className="form-group">
              <label className="form-label">
                Cliquez sur la carte pour sélectionner l'emplacement exact *
              </label>
              <GoogleMapComponent
                center={selectedLocation || mapCenter}
                zoom={selectedLocation ? 15 : 12}
                height="400px"
                clickable={true}
                onLocationSelect={handleLocationSelect}
              />
              {selectedLocation ? (
                <div className="alert alert-success mt-2">
                  <strong>✓ Localisation sélectionnée</strong>
                  <p style={{ margin: "10px 0 0 0" }}>
                    📍{" "}
                    {formData.localisation.adresse ||
                      "Chargement de l'adresse..."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null);
                      setFormData((prev) => ({
                        ...prev,
                        localisation: {
                          adresse: "",
                          ville: "",
                          codePostal: "",
                        },
                      }));
                    }}
                    className="btn btn-danger"
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      fontSize: "0.8rem",
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                <div className="alert alert-info mt-2">
                  💡 Cliquez sur la carte pour sélectionner l'emplacement de
                  votre salle. L'adresse sera automatiquement détectée.
                </div>
              )}
            </div>

            <h3 className="mt-4">📸 Photos (max 5) *</h3>
            <div className="form-group">
              <label className="form-label">
                Sélectionnez vos images depuis votre appareil
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || formData.images.length >= 5}
              />
              {uploading && (
                <p style={{ color: "var(--primary)", marginTop: "10px" }}>
                  ⏳ Upload en cours...
                </p>
              )}
              <small style={{ color: "var(--gray)" }}>
                Format accepté: JPG, PNG, WEBP (max 5MB par image)
              </small>
            </div>

            {formData.images.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                }}
              >
                {formData.images.map((img, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "var(--danger)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <small
              style={{
                display: "block",
                marginTop: "10px",
                color: "var(--gray)",
              }}
            >
              {formData.images.length}/5 images
            </small>

            <div className="form-group mt-3">
              <label className="form-label">
                Équipements (séparés par des virgules)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="WiFi, Projecteur, Tableau blanc"
                value={formData.equipements}
                onChange={(e) =>
                  setFormData({ ...formData, equipements: e.target.value })
                }
              />
            </div>

            <div className="grid grid-2 mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  uploading || !selectedLocation || formData.images.length === 0
                }
              >
                {editingRoom ? "Modifier la salle" : "Créer la salle"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal des réservations */}
      {selectedRoomBookings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRoomBookings(null);
            }
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Réservations - {selectedRoomBookings.roomTitle}</h2>
              <button
                onClick={() => setSelectedRoomBookings(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {selectedRoomBookings.bookings.length === 0 ? (
              <p className="mt-3">Aucune réservation pour cette salle</p>
            ) : (
              <div style={{ marginTop: "20px" }}>
                {selectedRoomBookings.bookings.map((booking) => (
                  <div
                    key={booking._id}
                    style={{
                      padding: "15px",
                      background: "var(--light)",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      border:
                        booking.statut === "en_attente"
                          ? "2px solid var(--warning)"
                          : "1px solid var(--border)",
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
                        <strong>
                          {booking.client.prenom} {booking.client.nom}
                        </strong>
                        <p
                          style={{
                            color: "var(--gray)",
                            fontSize: "0.9rem",
                            margin: "5px 0",
                          }}
                        >
                          📧 {booking.client.email}
                          {booking.client.telephone && (
                            <>
                              <br />
                              📞 {booking.client.telephone}
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge ${getBookingStatusBadge(booking.statut)}`}
                      >
                        {getBookingStatusText(booking.statut)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        background: "white",
                        borderRadius: "5px",
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
                        <strong>💰 Prix:</strong> {booking.prixTotal}€
                      </p>
                    </div>

                    {booking.statut === "en_attente" && (
                      <div
                        className="grid grid-2"
                        style={{ gap: "10px", marginTop: "10px" }}
                      >
                        <button
                          onClick={() => handleApproveBooking(booking._id)}
                          className="btn btn-success"
                        >
                          ✅ Approuver
                        </button>
                        <button
                          onClick={() => handleRefuseBooking(booking._id)}
                          className="btn btn-danger"
                        >
                          ❌ Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-3">
        {rooms.map((room) => {
          const pendingCount = getPendingBookingsCount(room._id);
          const roomBookings = getRoomBookings(room._id);

          return (
            <div
              key={room._id}
              className="card"
              style={{ position: "relative" }}
            >
              {/* Badge de notification */}
              {pendingCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setSelectedRoomBookings({
                      roomId: room._id,
                      roomTitle: room.titre,
                      bookings: roomBookings,
                    })
                  }
                  title={`${pendingCount} demande(s) en attente`}
                >
                  {pendingCount}
                </div>
              )}

              {room.images && room.images.length > 0 ? (
                <img
                  src={room.images[0]}
                  alt={room.titre}
                  className="card-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=Image+non+disponible";
                  }}
                  onClick={() =>
                    setSelectedRoomBookings({
                      roomId: room._id,
                      roomTitle: room.titre,
                      bookings: roomBookings,
                    })
                  }
                  style={{ cursor: "pointer" }}
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
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setSelectedRoomBookings({
                      roomId: room._id,
                      roomTitle: room.titre,
                      bookings: roomBookings,
                    })
                  }
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
                {getStatusBadge(room)}
              </div>

              <p
                style={{
                  color: "var(--gray)",
                  height: "60px",
                  overflow: "hidden",
                }}
              >
                {room.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >
                <span className="badge badge-primary">👥 {room.capacite}</span>
                <span className="badge badge-success">
                  {room.prix}€/{room.typePrix}
                </span>
                {room.noteMoyenne > 0 && (
                  <span className="badge badge-warning">
                    ⭐ {room.noteMoyenne.toFixed(1)}
                  </span>
                )}
                {room.images && room.images.length > 0 && (
                  <span className="badge badge-primary">
                    📸 {room.images.length}
                  </span>
                )}
                {roomBookings.length > 0 && (
                  <span
                    className="badge badge-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setSelectedRoomBookings({
                        roomId: room._id,
                        roomTitle: room.titre,
                        bookings: roomBookings,
                      })
                    }
                  >
                    📅 {roomBookings.length} réservation(s)
                  </span>
                )}
              </div>

              <div className="grid grid-2" style={{ gap: "10px" }}>
                <button
                  onClick={() => handleEdit(room)}
                  className="btn btn-primary"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="btn btn-danger"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rooms.length === 0 && !showForm && (
        <div className="card text-center py-4">
          <p>
            Vous n'avez pas encore de salle. Cliquez sur "Ajouter une salle"
            pour commencer !
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
