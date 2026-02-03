import React, { useEffect, useRef, useState } from "react";

const GoogleMapComponent = ({
  rooms = [],
  center = { lat: 36.7167, lng: 4.05 },
  zoom = 12,
  onLocationSelect = null,
  height = "500px",
  clickable = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Attendre que Google Maps soit chargé
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        setMapLoaded(true);
        initMap();
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [rooms, mapLoaded]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "greedy", // Permet le scroll
      scrollwheel: true,
    });

    mapInstanceRef.current = map;

    // Si la carte est cliquable pour sélectionner une localisation
    if (clickable && onLocationSelect) {
      let selectedMarker = null;

      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Supprimer l'ancien marqueur de sélection
        if (selectedMarker) {
          selectedMarker.setMap(null);
        }

        // Créer un nouveau marqueur
        selectedMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: "Localisation sélectionnée",
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });

        onLocationSelect({ lat, lng });
      });
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    if (rooms && rooms.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      rooms.forEach((room, index) => {
        const coords = getCoordinates(room);
        if (!coords) return;

        const marker = new window.google.maps.Marker({
          position: { lat: coords.lat, lng: coords.lng },
          map: map,
          title: room.titre,
          label: {
            text: `${index + 1}`,
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          },
          animation: window.google.maps.Animation.DROP,
        });

        // InfoWindow avec détails
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(room, index + 1),
        });

        marker.addListener("click", () => {
          // Fermer toutes les autres infowindows
          markersRef.current.forEach((m) => {
            if (m.infoWindow) m.infoWindow.close();
          });
          infoWindow.open(map, marker);
        });

        marker.infoWindow = infoWindow;
        markersRef.current.push(marker);
        bounds.extend(marker.getPosition());
      });

      // Ajuster la vue pour inclure tous les marqueurs
      if (rooms.length > 1) {
        map.fitBounds(bounds);
      } else if (rooms.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      }
    } else {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  };

  const createInfoWindowContent = (room, number) => {
    return `
      <div style="padding: 10px; max-width: 280px; font-family: 'Poppins', sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: #6366f1; font-size: 16px;">
          ${number}. ${room.titre}
        </h3>
        ${
          room.images && room.images.length > 0
            ? `
          <img src="${room.images[0]}" alt="${room.titre}" 
            style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" 
            onerror="this.src='https://via.placeholder.com/280x140?text=Image+non+disponible'" />
        `
            : `
          <div style="width: 100%; height: 140px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
            🏢
          </div>
        `
        }
        <p style="margin: 5px 0; font-size: 13px; color: #666;">
          <strong>📍</strong> ${room.localisation.ville}, ${room.localisation.codePostal}
        </p>
        <p style="margin: 5px 0; font-size: 13px; color: #666;">
          <strong>👥</strong> ${room.capacite} personnes
        </p>
        <p style="margin: 5px 0; font-size: 13px; color: #666;">
          <strong>💰</strong> ${room.prix}€/${room.typePrix}
        </p>
        ${
          room.noteMoyenne > 0
            ? `
          <p style="margin: 5px 0; font-size: 13px; color: #666;">
            <strong>⭐</strong> ${room.noteMoyenne.toFixed(1)}/5 (${room.nombreAvis} avis)
          </p>
        `
            : ""
        }
        <a href="/room/${room._id}" 
          style="display: inline-block; margin-top: 10px; color: white; background: #6366f1; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
          Voir les détails →
        </a>
      </div>
    `;
  };

  const getCoordinates = (room) => {
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

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: height,
        borderRadius: "8px",
        border: "2px solid #e5e7eb",
        overflow: "hidden",
      }}
    />
  );
};

export default GoogleMapComponent;
