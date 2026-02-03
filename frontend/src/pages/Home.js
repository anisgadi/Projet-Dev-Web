import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../services/roomService";
import { toast } from "react-toastify";
import GoogleMapComponent from "../components/GoogleMapComponent";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 36.7167, lng: 4.05 });
  const [filters, setFilters] = useState({
    search: "",
    capacite: "",
    prixMax: "",
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter({ lat: location.latitude, lng: location.longitude });
        },
        (error) => {
          console.log("Géolocalisation refusée");
        },
      );
    }
    fetchRooms();
  }, []);

  const fetchRooms = async (customFilters = {}) => {
    try {
      setLoading(true);
      const params = {};

      if (customFilters.search) params.search = customFilters.search;
      if (customFilters.capacite) params.capacite = customFilters.capacite;
      if (customFilters.prixMax) params.prixMax = customFilters.prixMax;

      const data = await getRooms(params);
      setRooms(data.data);
      if (allRooms.length === 0) {
        setAllRooms(data.data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms(filters);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const getCoordinates = (room) => {
    if (!room.localisation) return null;

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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Trouvez la salle parfaite</h1>
          <p className="hero-subtitle">
            Des milliers de salles de réunion et d'événements à votre
            disposition
          </p>
        </div>
      </section>

      <section className="container py-4">
        <div className="card">
          <h2 className="mb-3">Rechercher une salle</h2>
          <form onSubmit={handleSearch}>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Recherche</label>
                <input
                  type="text"
                  name="search"
                  className="form-control"
                  placeholder="Titre, ville..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacité min.</label>
                <input
                  type="number"
                  name="capacite"
                  className="form-control"
                  placeholder="Ex: 10"
                  value={filters.capacite}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix max.</label>
                <input
                  type="number"
                  name="prixMax"
                  className="form-control"
                  placeholder="Ex: 100"
                  value={filters.prixMax}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: "20px" }}>
              <button type="submit" className="btn btn-primary">
                🔍 Rechercher
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMap(!showMap)}
              >
                🗺️ {showMap ? "Masquer" : "Afficher"} la carte
              </button>
            </div>
          </form>
        </div>
      </section>

      {showMap && allRooms.length > 0 && (
        <section className="container py-4">
          <div className="card">
            <h3 className="mb-3">
              📍 Carte des salles disponibles ({allRooms.length})
            </h3>
            <GoogleMapComponent
              rooms={allRooms}
              center={mapCenter}
              zoom={12}
              height="500px"
            />
          </div>
        </section>
      )}

      <section className="container py-4">
        <h2 className="mb-4">Salles disponibles ({rooms.length})</h2>

        {rooms.length === 0 ? (
          <div className="card text-center py-4">
            <p>Aucune salle trouvée</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {rooms.map((room) => {
              const coords = getCoordinates(room);
              const distance =
                userLocation && coords
                  ? calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      coords.lat,
                      coords.lng,
                    )
                  : null;

              return (
                <Link
                  to={`/room/${room._id}`}
                  key={room._id}
                  style={{ textDecoration: "none" }}
                >
                  <div className="card">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.titre}
                        className="card-image"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x200?text=Image+non+disponible";
                        }}
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

                    <h3 className="card-title">{room.titre}</h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="badge badge-primary">
                        👥 {room.capacite} pers.
                      </span>
                      <span className="badge badge-success">
                        {room.prix}€/{room.typePrix}
                      </span>
                      {room.noteMoyenne > 0 && (
                        <span className="badge badge-warning">
                          ⭐ {room.noteMoyenne.toFixed(1)}
                        </span>
                      )}
                      {distance && (
                        <span className="badge badge-primary">
                          📍 {distance} km
                        </span>
                      )}
                    </div>

                    <p
                      className="card-text"
                      style={{ height: "60px", overflow: "hidden" }}
                    >
                      {room.description}
                    </p>

                    <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                      📍 {room.localisation.ville},{" "}
                      {room.localisation.codePostal}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
