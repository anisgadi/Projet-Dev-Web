import React from "react";

const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={handleBackdropClick}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          color: "white",
          fontSize: "2rem",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 10000,
        }}
      >
        ✕
      </button>

      {/* Flèche gauche */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          style={{
            position: "absolute",
            left: "20px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "none",
            color: "white",
            fontSize: "2rem",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 10000,
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        style={{
          maxWidth: "90%",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: "8px",
        }}
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/800x600?text=Image+non+disponible";
        }}
      />

      {/* Flèche droite */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          style={{
            position: "absolute",
            right: "20px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "none",
            color: "white",
            fontSize: "2rem",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 10000,
          }}
        >
          ›
        </button>
      )}

      {/* Compteur */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "20px",
            fontSize: "1rem",
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
